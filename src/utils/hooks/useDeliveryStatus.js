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

// Geocode address using Nominatim API
const geocodeAddress = async (address) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        address
      )}&countrycodes=vn`
    );
    const data = await response.json();

    if (data && data.length > 0) {
      const location = data[0];
      return {
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lon),
      };
    }
    return null;
  } catch (err) {
    console.error("Geocoding error:", err);
    return null;
  }
};

export function useDeliveryStatus(orderId) {
  const [distance, setDistance] = useState(null);
  const [droneArrived, setDroneArrived] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    const fetchDeliveryStatus = async () => {
      try {
        // Get order details
        const { data: order, error: orderErr } = await supabase
          .from("orders")
          .select(
            "order_id, order_status, delivery_address, merchant_id, delivery_started_at"
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
            const dist = calculateDistance(
              merchantCoords.lat,
              merchantCoords.lng,
              customerCoords.lat,
              customerCoords.lng
            );
            setDistance(dist);

            // Drone arrived if distance < 0.5 km (500m)
            const arrived = dist < 0.5;
            setDroneArrived(arrived);

            console.log(`Delivery distance: ${dist.toFixed(2)} km, Arrived: ${arrived}`);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching delivery status:", err);
        setLoading(false);
      }
    };

    fetchDeliveryStatus();

    // Poll every 30 seconds to check if drone arrived
    const interval = setInterval(fetchDeliveryStatus, 30000);
    return () => clearInterval(interval);
  }, [orderId]);

  return { distance, droneArrived, orderStatus, loading };
}
