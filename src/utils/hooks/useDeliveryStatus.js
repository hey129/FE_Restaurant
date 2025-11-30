import { useEffect, useState } from "react";
import { supabase } from "~/Api/supabase";

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Geocode address using Nominatim API with retry logic
const geocodeAddress = async (address, retries = 3) => {
  try {
    console.log(
      `🔍 [${new Date().toLocaleTimeString()}] Geocoding: "${address}"`
    );
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        address
      )}&countrycodes=vn&limit=5`
    );
    const data = await response.json();

    if (data && data.length > 0) {
      const location = data[0];
      console.log(
        `✅ Geocoded "${address}" → [${location.lat}, ${location.lon}]`
      );
      return {
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lon),
      };
    }

    console.warn(`⚠️ No geocoding results for: "${address}"`);

    // Retry with simplified address
    if (retries > 1 && address.includes(",")) {
      const simplifiedAddress = address.split(",")[0].trim();
      if (simplifiedAddress !== address) {
        console.log(`🔄 Retry with simplified: "${simplifiedAddress}"`);
        return geocodeAddress(simplifiedAddress, retries - 1);
      }
    }

    return null;
  } catch (err) {
    console.error(`❌ Geocoding error for "${address}":`, err.message);
    if (retries > 1) {
      console.log(
        `🔄 Geocoding retry ${4 - retries + 1}/${retries} after 1s...`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return geocodeAddress(address, retries - 1);
    }
    return null;
  }
};

export function useDeliveryStatus(orderId, isSimulator = false) {
  const [distance, setDistance] = useState(null);
  const [droneArrived, setDroneArrived] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [droneLocation, setDroneLocation] = useState(null); // Track drone position

  useEffect(() => {
    if (!orderId) return;

    // If order is already completed/failed/cancelled, stop all logic
    if (
      orderStatus === "Completed" ||
      orderStatus === "Failed" ||
      orderStatus === "Cancelled"
    ) {
      console.log(
        `[${new Date().toLocaleTimeString()}] ⏹️  Order #${orderId} is ${orderStatus} - stopping tracking`
      );
      return;
    }

    const fetchDeliveryStatus = async () => {
      try {
        // Get order details
        const { data: order, error: orderErr } = await supabase
          .from("orders")
          .select(
            "order_id, order_status, delivery_address, merchant_id"
          )
          .eq("order_id", orderId)
          .single();

        if (orderErr) throw orderErr;

        setOrderStatus(order.order_status);

        // Get delivery assignment if shipping
        let assignment = null;
        if (order.order_status === "Shipping") {
          const { data: assignData, error: assignErr } = await supabase
            .from("delivery_assignment")
            .select("assigned_at, drone_id, pickup_lat, pickup_lng, drop_lat, drop_lng")
            .eq("order_id", orderId)
            .single();

          if (!assignErr) {
            assignment = assignData;
          }
        }

        // Auto-fail check: if order is Shipping and assigned_at > 1 hour ago
        if (order.order_status === "Shipping" && assignment?.assigned_at) {
          const assignedTime = new Date(assignment.assigned_at);
          const timeSinceAssignment =
            (new Date() - assignedTime) / 1000 / 60; // minutes

          if (timeSinceAssignment > 60) {
            console.warn(
              `⏰ Order #${orderId} has been shipping for ${timeSinceAssignment.toFixed(
                1
              )} min (> 1 hour) - auto-failing order`
            );
            // Auto-fail the order
            const { error } = await supabase
              .from("orders")
              .update({
                order_status: "Failed",
              })
              .eq("order_id", orderId);

            if (error) {
              console.error(`❌ Error auto-failing order #${orderId}:`, error);
            } else {
              console.log(
                `✅ Order #${orderId} auto-failed after 1 hour inactivity`
              );
              setOrderStatus("Failed");
              return; // Exit early, don't process further
            }
          }
        }

        // Only calculate distance if order is Shipping
        if (order.order_status === "Shipping" && assignment?.assigned_at) {
          // Use coordinates from assignment if available, otherwise geocode (fallback)
          let startLat = assignment.pickup_lat;
          let startLng = assignment.pickup_lng;
          let endLat = assignment.drop_lat;
          let endLng = assignment.drop_lng;

          // If coordinates are missing in DB (legacy orders), fallback to geocoding
          if (!startLat || !endLat) {
            // Get merchant address
            const { data: merchant, error: merchantErr } = await supabase
              .from("merchant")
              .select("address")
              .eq("merchant_id", order.merchant_id)
              .single();

            if (merchantErr) throw merchantErr;

            // Geocode both addresses
            const [merchantCoords, customerCoords] = await Promise.all([
              geocodeAddress(merchant.address),
              geocodeAddress(order.delivery_address),
            ]);

            if (merchantCoords) {
              startLat = merchantCoords.lat;
              startLng = merchantCoords.lng;
            }
            if (customerCoords) {
              endLat = customerCoords.lat;
              endLng = customerCoords.lng;
            }
          }

          if (startLat && endLat) {
            // Calculate total distance
            const totalDistance = calculateDistance(
              startLat,
              startLng,
              endLat,
              endLng
            );
            // Calculate elapsed time based on assigned_at
            const deliveryStartTime = new Date(assignment.assigned_at);
            const currentTime = new Date();
            const elapsedSeconds = (currentTime - deliveryStartTime) / 1000;

            // Calculate speed to complete delivery in exactly 1 minute (60 seconds)
            const simulationDurationSeconds = 60;
            const speedKmPerSec = totalDistance / simulationDurationSeconds;

            const distanceTraveled = elapsedSeconds * speedKmPerSec;

            // Remaining distance
            let remainingDistance = totalDistance - distanceTraveled;
            if (remainingDistance < 0) remainingDistance = 0;

            // Calculate drone position
            const travelRatio = totalDistance > 0 ? Math.min(distanceTraveled / totalDistance, 1) : 1;
            const currentDroneLat = startLat + (endLat - startLat) * travelRatio;
            const currentDroneLng = startLng + (endLng - startLng) * travelRatio;

            setDistance(remainingDistance);
            setDroneLocation({ lat: currentDroneLat, lng: currentDroneLng });

            // Drone arrived if distance < 0.1 km (100m)
            const arrived = remainingDistance < 0.1;
            setDroneArrived(arrived);

            // SIMULATION: Update DB if isSimulator is true
            if (isSimulator && assignment.drone_id) {
              await supabase.from("drone").update({
                current_lat: currentDroneLat,
                current_lng: currentDroneLng,
                status: arrived ? "idle" : "delivering" // Optional: free up drone when arrived?
              }).eq("drone_id", assignment.drone_id);
            }
          }
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching delivery status:", err);
        setLoading(false);
      }
    };

    // Initial fetch
    fetchDeliveryStatus();

    // Subscribe to real-time updates on this order
    const channel = supabase
      .channel(`order_${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          console.log(
            `[${new Date().toLocaleTimeString()}] 🔄 Real-time update for order #${orderId}:`,
            payload.new
          );
          // Refetch when order changes
          fetchDeliveryStatus();
        }
      )
      .subscribe();

    // Poll every 1 second to update drone position
    const interval = setInterval(fetchDeliveryStatus, 1000);

    console.log(
      `[${new Date().toLocaleTimeString()}] 🎯 Started tracking order #${orderId}`
    );

    // Cleanup
    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
      console.log(
        `[${new Date().toLocaleTimeString()}] ❌ Stopped tracking order #${orderId}`
      );
    };
  }, [orderId, orderStatus, isSimulator]);

  return { distance, droneArrived, orderStatus, loading, droneLocation };
}
