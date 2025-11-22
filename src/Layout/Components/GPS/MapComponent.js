import React, { useEffect, useRef, useState } from "react";
import { supabase } from "~/Api/supabase";
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

export function MapComponent({ orderId, customerAddress }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [restaurantLocation, setRestaurantLocation] = useState(null);
  const [customerLocation, setCustomerLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [loading, setLoading] = useState(true);

  // Geocode using OpenStreetMap Nominatim API (free, no key needed)
  const geocodeAddress = async (address) => {
    try {
      console.log("Geocoding address:", address);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address
        )}&countrycodes=vn`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const location = data[0];
        console.log("Geocoded location:", location);
        return {
          lat: parseFloat(location.lat),
          lng: parseFloat(location.lon),
        };
      }
      console.warn("No results from geocoding for address:", address);
      return null;
    } catch (err) {
      console.error("Geocoding error:", err);
      return null;
    }
  };

  // Fetch order and merchant details
  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        // Get order with merchant info
        const { data: order, error: orderErr } = await supabase
          .from("orders")
          .select("order_id, merchant_id, delivery_address")
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
          } else {
            // Fallback: default location
            console.log("Using fallback for restaurant");
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
          } else {
            // Fallback: default location
            console.log("Using fallback for delivery");
            setCustomerLocation({
              lat: 10.785,
              lng: 106.715,
              name: "Delivery Address",
              address: order.delivery_address,
            });
          }
        }

        // Don't calculate distance here - will do in separate useEffect
        setLoading(false);
      } catch (err) {
        console.error("Error fetching location data:", err);
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
      const time = estimateDeliveryTime(dist);
      setDistance(dist);
      setEstimatedTime(time);
    }
  }, [restaurantLocation, customerLocation]);

  useEffect(() => {
    // Initialize map once locations are loaded
    if (!mapRef.current || !restaurantLocation || !customerLocation || loading)
      return;

    // Create map centered between two locations
    const centerLat = (restaurantLocation.lat + customerLocation.lat) / 2;
    const centerLng = (restaurantLocation.lng + customerLocation.lng) / 2;

    mapInstance.current = L.map(mapRef.current).setView(
      [centerLat, centerLng],
      13
    );

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(mapInstance.current);

    // Restaurant marker (red)
    L.marker([restaurantLocation.lat, restaurantLocation.lng], {
      icon: L.icon({
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      }),
    })
      .bindPopup(
        `<strong>${restaurantLocation.name}</strong><br/>${restaurantLocation.address}`
      )
      .addTo(mapInstance.current);

    // Delivery marker (blue)
    L.marker([customerLocation.lat, customerLocation.lng], {
      icon: L.icon({
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      }),
    })
      .bindPopup(
        `<strong>${customerLocation.name}</strong><br/>${customerLocation.address}`
      )
      .addTo(mapInstance.current);

    // Draw route line
    const latlngs = [
      [restaurantLocation.lat, restaurantLocation.lng],
      [customerLocation.lat, customerLocation.lng],
    ];
    L.polyline(latlngs, {
      color: "#4a90e2",
      weight: 3,
      opacity: 0.8,
    }).addTo(mapInstance.current);

    // Drone marker (in the middle of route)
    const droneLat = (restaurantLocation.lat + customerLocation.lat) / 2;
    const droneLng = (restaurantLocation.lng + customerLocation.lng) / 2;

    const dronePopupText = `<strong>🚁 Drone Delivering</strong><br/>
      Distance: ${distance ? distance.toFixed(2) : "N/A"} km<br/>
      Est. Time: ${estimatedTime ? estimatedTime + " mins" : "N/A"}`;

    L.marker([droneLat, droneLng], {
      icon: L.divIcon({
        html: `<div style="font-size: 24px;">🚁</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15],
      }),
    })
      .bindPopup(dronePopupText)
      .addTo(mapInstance.current);

    // Adjust map bounds
    const group = new L.featureGroup([
      L.marker([restaurantLocation.lat, restaurantLocation.lng]),
      L.marker([customerLocation.lat, customerLocation.lng]),
    ]);
    mapInstance.current.fitBounds(group.getBounds().pad(0.1));

    // Cleanup
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantLocation, customerLocation, loading]);

  return (
    <div
      style={{
        width: "100%",
        borderRadius: "8px",
        marginTop: "10px",
      }}
    >
      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: "400px",
          borderRadius: "8px",
        }}
      />
      {restaurantLocation && customerLocation && (
        <div style={{ marginTop: "10px" }}>
          <p>
            <strong>From:</strong> {restaurantLocation.address}
          </p>
          <p>
            <strong>To:</strong> {customerLocation.address}
          </p>
          {distance && estimatedTime && (
            <div
              style={{
                backgroundColor: "#f0f4ff",
                padding: "10px",
                borderRadius: "4px",
                marginTop: "10px",
              }}
            >
              <p style={{ margin: "5px 0" }}>
                <strong>📍 Distance:</strong> {distance.toFixed(2)} km
              </p>
              <p style={{ margin: "5px 0" }}>
                <strong>⏱️ Estimated Time:</strong> {estimatedTime} minutes
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
