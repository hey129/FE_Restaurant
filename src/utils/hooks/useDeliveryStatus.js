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

export function useDeliveryStatus(orderId) {
  const [distance, setDistance] = useState(null);
  const [droneArrived, setDroneArrived] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [droneLocation, setDroneLocation] = useState(null); // Track drone position

  useEffect(() => {
    if (!orderId) return;

    const fetchDeliveryStatus = async () => {
      try {
        // Get order details
        const { data: order, error: orderErr } = await supabase
          .from("orders")
          .select(
            "order_id, order_status, delivery_address, merchant_id, delivery_started_at, delivery_updated_at"
          )
          .eq("order_id", orderId)
          .single();

        if (orderErr) throw orderErr;

        setOrderStatus(order.order_status);

        // Only calculate distance if order is Shipping
        if (order.order_status === "Shipping" && order.delivery_address) {
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

          if (merchantCoords && customerCoords) {
            // Calculate total distance from restaurant to customer
            const totalDistance = calculateDistance(
              merchantCoords.lat,
              merchantCoords.lng,
              customerCoords.lat,
              customerCoords.lng
            );

            // Calculate elapsed time based on delivery_updated_at
            // This is updated every 2 minutes, each update = drone moved 2km closer
            const deliveryStartTime = new Date(order.delivery_started_at);
            const deliveryUpdateTime = new Date(order.delivery_updated_at);
            const elapsedSeconds =
              (deliveryUpdateTime - deliveryStartTime) / 1000;

            // Number of 2-minute intervals that have passed
            const twoMinuteIntervals = Math.floor(elapsedSeconds / 120);

            // Distance traveled by drone: 2km per 2-minute interval
            const distanceTraveled = twoMinuteIntervals * 2;

            // Remaining distance to customer
            let remainingDistance = totalDistance - distanceTraveled;
            if (remainingDistance < 0) remainingDistance = 0; // Can't go past customer

            // Calculate drone position along the path
            // Ratio of distance traveled / total distance
            const travelRatio = Math.min(distanceTraveled / totalDistance, 1);
            const currentDroneLat =
              merchantCoords.lat +
              (customerCoords.lat - merchantCoords.lat) * travelRatio;
            const currentDroneLng =
              merchantCoords.lng +
              (customerCoords.lng - merchantCoords.lng) * travelRatio;

            setDistance(remainingDistance);
            setDroneLocation({ lat: currentDroneLat, lng: currentDroneLng });

            // Drone arrived if distance < 0.5 km (500m)
            const arrived = remainingDistance < 0.5;
            setDroneArrived(arrived);

            console.log(
              `[${new Date().toLocaleTimeString()}] 📍 Order #${orderId}:`
            );
            console.log(
              `   Elapsed: ${(elapsedSeconds / 60).toFixed(
                1
              )} min | Intervals: ${twoMinuteIntervals}`
            );
            console.log(`   Total distance: ${totalDistance.toFixed(2)} km`);
            console.log(
              `   Distance traveled: ${distanceTraveled.toFixed(2)} km (${(
                travelRatio * 100
              ).toFixed(1)}%)`
            );
            console.log(
              `   Drone: [${currentDroneLat.toFixed(
                4
              )}, ${currentDroneLng.toFixed(4)}]`
            );
            console.log(
              `   Customer: [${customerCoords.lat.toFixed(
                4
              )}, ${customerCoords.lng.toFixed(4)}]`
            );
            console.log(
              `   Remaining: ${remainingDistance.toFixed(2)} km | Arrived: ${
                arrived ? "✅ YES" : "❌ NO"
              }`
            );
          } else {
            console.warn(
              `⚠️ Could not geocode for order #${orderId} - merchant: ${
                merchantCoords ? "✅" : "❌"
              }, customer: ${customerCoords ? "✅" : "❌"}`
            );
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

    // Poll every 2 minutes (120000ms) to update delivery_updated_at
    const interval = setInterval(fetchDeliveryStatus, 120000);

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
  }, [orderId]);

  return { distance, droneArrived, orderStatus, loading, droneLocation };
}
