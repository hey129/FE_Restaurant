import React, { useEffect, useRef, useState } from "react";
import { supabase } from "~/Api/supabase";
import { useDeliveryStatus } from "~/utils/hooks/useDeliveryStatus";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

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

// Estimate delivery time (average speed: 30 km/h for urban delivery)
const estimateDeliveryTime = (distanceKm) => {
  const speedKmPerHour = 30;
  const timeMinutes = (distanceKm / speedKmPerHour) * 60;
  return Math.ceil(timeMinutes);
};

export function MapComponent({ orderId, customerAddress, isSimulator = false }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [restaurantLocation, setRestaurantLocation] = useState(null);
  const [customerLocation, setCustomerLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get drone location from delivery status hook
  const { droneLocation, distance: deliveryDistance } =
    useDeliveryStatus(orderId, isSimulator);

  // Fetch order and merchant details
  useEffect(() => {
    const fetchLocationData = async () => {
      // Define geocodeAddress locally to avoid dependency issues
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

          console.warn(
            `⚠️ [${new Date().toLocaleTimeString()}] No results for: "${address}"`
          );

          // Retry with simplified address (remove district/city info)
          if (retries > 1 && address.includes(",")) {
            const simplifiedAddress = address.split(",")[0].trim();
            if (simplifiedAddress !== address) {
              console.log(
                `🔄 Retry with simplified: "${simplifiedAddress}" (${retries - 1
                } attempts left)`
              );
              return geocodeAddress(simplifiedAddress, retries - 1);
            }
          }

          return null;
        } catch (err) {
          console.error(`❌ Geocoding error for "${address}":`, err.message);
          if (retries > 1) {
            console.log(`🔄 Retry ${4 - retries + 1}/${retries} after 1s...`);
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return geocodeAddress(address, retries - 1);
          }
          return null;
        }
      };

      try {
        // Get order with merchant info
        const { data: order, error: orderErr } = await supabase
          .from("orders")
          .select(
            "order_id, merchant_id, delivery_address, order_status"
          )
          .eq("order_id", orderId)
          .single();

        if (orderErr) throw orderErr;

        // Get merchant address
        const { data: merchant, error: merchantErr } = await supabase
          .from("merchant")
          .select("merchant_id, merchant_name, address")
          .eq("merchant_id", order.merchant_id)
          .single();

        if (merchantErr) throw merchantErr;

        console.log(
          `📍 Merchant: ${merchant.merchant_name} at "${merchant.address}"`
        );
        console.log(`📦 Delivery: "${order.delivery_address}"`);

        // Geocode merchant address
        if (merchant && merchant.address) {
          const merchantCoords = await geocodeAddress(merchant.address);
          if (merchantCoords) {
            setRestaurantLocation({
              lat: merchantCoords.lat,
              lng: merchantCoords.lng,
              name: merchant.merchant_name,
              address: merchant.address,
            });
            console.log(
              `✅ Restaurant location set: [${merchantCoords.lat}, ${merchantCoords.lng}]`
            );
          } else {
            // Fallback: default Ho Chi Minh location
            console.warn("⚠️ Geocoding failed for restaurant - using fallback");
            setRestaurantLocation({
              lat: 10.7769,
              lng: 106.7009,
              name: merchant.merchant_name,
              address: merchant.address,
            });
          }
        }

        // Geocode delivery address
        if (order.delivery_address) {
          const customerCoords = await geocodeAddress(order.delivery_address);
          if (customerCoords) {
            setCustomerLocation({
              lat: customerCoords.lat,
              lng: customerCoords.lng,
              name: "Delivery Address",
              address: order.delivery_address,
            });
            console.log(
              `✅ Customer location set: [${customerCoords.lat}, ${customerCoords.lng}]`
            );
          } else {
            // Fallback
            console.warn("⚠️ Geocoding failed for delivery - using fallback");
            setCustomerLocation({
              lat: 10.785,
              lng: 106.715,
              name: "Delivery Address",
              address: order.delivery_address,
            });
          }
        }

        setLoading(false);
      } catch (err) {
        console.error("❌ Error fetching location data:", err);
        setLoading(false);
      }
    };

    if (orderId) {
      fetchLocationData();
    }
  }, [orderId, customerAddress]);

  // Calculate distance and time when locations are available
  useEffect(() => {
    if (restaurantLocation && customerLocation) {
      const dist = calculateDistance(
        restaurantLocation.lat,
        restaurantLocation.lng,
        customerLocation.lat,
        customerLocation.lng
      );
      const estTime = estimateDeliveryTime(dist);
      setDistance(dist);
      setEstimatedTime(estTime);

      console.log(
        `📏 Map distance calculated: ${dist.toFixed(2)} km ≈ ${estTime} minutes`
      );
    }
  }, [restaurantLocation, customerLocation]);

  // Render map
  useEffect(() => {
    if (!restaurantLocation || !customerLocation || !mapRef.current) return;

    // Cleanup previous map instance
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      // Double check mapRef still exists
      if (!mapRef.current) return;

      // Initialize map centered between restaurant and customer
      const centerLat = (restaurantLocation.lat + customerLocation.lat) / 2;
      const centerLng = (restaurantLocation.lng + customerLocation.lng) / 2;

      mapInstance.current = L.map(mapRef.current).setView(
        [centerLat, centerLng],
        12
      );

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(mapInstance.current);

      // Drone marker (current position)
      const droneLat = droneLocation?.lat || restaurantLocation.lat;
      const droneLng = droneLocation?.lng || restaurantLocation.lng;

      L.marker([droneLat, droneLng], {
        title: "🚁 Drone",
        icon: L.divIcon({
          html: '<div style="font-size: 28px; text-align: center; filter: drop-shadow(0 0 2px rgba(0,0,0,0.5));">🚁</div>',
          iconSize: [30, 30],
          className: "drone-marker",
        }),
      })
        .addTo(mapInstance.current)
        .bindPopup(
          `<strong>🚁 Drone</strong><br/>Distance to customer: ${deliveryDistance?.toFixed(2) || "?"
          }km`
        );

      // Restaurant marker (starting point)
      L.marker([restaurantLocation.lat, restaurantLocation.lng], {
        title: restaurantLocation.name,
        icon: L.icon({
          iconUrl:
            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='red'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3C/svg%3E",
          iconSize: [25, 25],
        }),
      })
        .addTo(mapInstance.current)
        .bindPopup(
          `<strong>${restaurantLocation.name}</strong><br/>${restaurantLocation.address}`
        );

      // Customer marker
      L.marker([customerLocation.lat, customerLocation.lng], {
        title: customerLocation.name,
        icon: L.icon({
          iconUrl:
            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='green'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3C/svg%3E",
          iconSize: [25, 25],
        }),
      })
        .addTo(mapInstance.current)
        .bindPopup(
          `<strong>${customerLocation.name}</strong><br/>${customerLocation.address}`
        );

      // Draw route line
      const latlngs = [
        [restaurantLocation.lat, restaurantLocation.lng],
        [customerLocation.lat, customerLocation.lng],
      ];
      L.polyline(latlngs, { color: "blue", weight: 3 }).addTo(
        mapInstance.current
      );

      // Fit bounds
      const bounds = L.latLngBounds([
        [restaurantLocation.lat, restaurantLocation.lng],
        [customerLocation.lat, customerLocation.lng],
      ]);
      mapInstance.current.fitBounds(bounds.pad(0.1));
    }, 100);

    return () => clearTimeout(timer);
  }, [restaurantLocation, customerLocation, droneLocation, deliveryDistance]);

  if (loading) {
    return (
      <div ref={mapRef} style={{ height: "400px", background: "#f0f0f0" }}>
        Loading map...
      </div>
    );
  }

  return (
    <div>
      <div ref={mapRef} style={{ height: "400px", borderRadius: "8px" }} />
      {distance && (
        <div
          style={{
            marginTop: "16px",
            padding: "12px",
            background: "#f9f9f9",
            borderRadius: "4px",
          }}
        >
          <p>
            <strong>Distance:</strong> {distance.toFixed(2)} km
          </p>
          <p>
            <strong>Est. Delivery Time:</strong> ~{estimatedTime} minutes
          </p>
        </div>
      )}
    </div>
  );
}
