import React, { useEffect, useRef } from "react";
import { View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WebView, WebViewMessageEvent } from "react-native-webview";

export interface DroneMapProps {
  orderId: number;
  restaurant: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  lastPosition?: { lat: number; lng: number };
  onProgress?: (d: { type: string; lat: number; lng: number }) => void;
  onArrived?: (d: { type: string; lat: number; lng: number }) => void;
}

const DroneMap: React.FC<DroneMapProps> = ({
  orderId,
  restaurant,
  destination,
  lastPosition,
  onProgress,
  onArrived,
}) => {
  const webviewRef = useRef<WebView>(null);

  const start = lastPosition ?? restaurant;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />

        <style>
          html, body { margin:0; padding:0; height:100%; }
          #map { height:100%; width:100%; }
        </style>

        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.3/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.3/dist/leaflet.js"></script>
    </head>

    <body>
      <div id="map"></div>

      <script>
        const startPos = [${start.lat}, ${start.lng}];
        const restaurant = [${restaurant.lat}, ${restaurant.lng}];
        const destination = [${destination.lat}, ${destination.lng}];

        const map = L.map('map').setView(startPos, 14);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
        }).addTo(map);

        const route = L.polyline([restaurant, destination], {
          color: "#007BFF",
          weight: 5
        }).addTo(map);

        map.fitBounds(route.getBounds(), { padding: [20,20] });

        const droneIcon = L.icon({
          iconUrl: "https://cdn-icons-png.flaticon.com/512/3211/3211277.png",
          iconSize: [45, 45],
        });

        const restaurantIcon = L.icon({
          iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
          iconSize: [40, 40]
        });

        const destinationIcon = L.icon({
          iconUrl: "https://cdn-icons-png.flaticon.com/512/17553/17553135.png",
          iconSize: [40, 40]
        });

        L.marker(restaurant, { icon: restaurantIcon }).addTo(map);
        L.marker(destination, { icon: destinationIcon }).addTo(map);

        const marker = L.marker(startPos, { icon: droneIcon }).addTo(map);

        let t = 0;
        const duration = 30000;
        const fps = 30;

        const animate = () => {
          t += 1000 / fps;
          const k = Math.min(t / duration, 1);

          const lat = startPos[0] + (destination[0] - startPos[0]) * k;
          const lng = startPos[1] + (destination[1] - startPos[1]) * k;

          marker.setLatLng([lat, lng]);

          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: "DRONE_PROGRESS",
            lat, lng
          }));

          if (k >= 1) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: "DRONE_ARRIVED",
              lat, lng
            }));
            return;
          }

          setTimeout(animate, 1000 / fps);
        };

        animate();
      </script>
    </body>
    </html>
  `;

  const handleMessage = async (ev: WebViewMessageEvent) => {
    try {
      const msg = JSON.parse(ev.nativeEvent.data);

      // Lưu vị trí cuối cùng
      await AsyncStorage.setItem(
        `drone-pos-${orderId}`,
        JSON.stringify({ lat: msg.lat, lng: msg.lng })
      );

      if (msg.type === "DRONE_PROGRESS") {
        onProgress?.(msg); // CHỈ gửi lat/lng
      }

      if (msg.type === "DRONE_ARRIVED") {
        onArrived?.(msg); // CHỈ gửi lat/lng
      }

    } catch {}
  };

  return (
    <View style={{ height: 260, borderRadius: 16, overflow: "hidden" }}>
      <WebView
        ref={webviewRef}
        originWhitelist={["*"]}
        source={{ html }}
        onMessage={handleMessage}
      />
    </View>
  );
};

export default DroneMap;
