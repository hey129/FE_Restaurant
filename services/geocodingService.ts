/**
 * Geocoding Service - Chuyển địa chỉ thành GPS coordinates
 * Sử dụng Nominatim OpenStreetMap API (Free, không cần API key)
 */

export interface GeocodingResult {
  lat: number;
  lng: number;
  display_name: string;
}

/**
 * Chuyển địa chỉ thành tọa độ GPS
 * @param address - Địa chỉ cần tìm (tiếng Việt được)
 * @returns {lat, lng, display_name} hoặc null nếu không tìm thấy
 */
export async function geocodeAddress(
  address: string
): Promise<GeocodingResult | null> {
  try {
    if (!address || address.trim() === "") {
      console.error("Địa chỉ không được để trống");
      return null;
    }

    // Thêm "Vietnam" vào cuối để tăng độ chính xác
    const searchQuery = address.includes("Việt Nam") || address.includes("Vietnam")
      ? address
      : `${address}, Vietnam`;

    // Encode địa chỉ cho URL
    const encodedAddress = encodeURIComponent(searchQuery);

    // Call Nominatim API
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "RestaurantDeliveryApp/1.0", // Required by Nominatim
      },
    });

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      console.warn(`Không tìm thấy tọa độ cho địa chỉ: ${address}`);
      return null;
    }

    const result = data[0];

    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      display_name: result.display_name,
    };
  } catch (error) {
    console.error("Lỗi geocoding:", error);
    return null;
  }
}

/**
 * Chuyển tọa độ GPS thành địa chỉ (Reverse Geocoding)
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns Địa chỉ hoặc null nếu không tìm thấy
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "RestaurantDeliveryApp/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`Reverse geocoding error: ${response.status}`);
    }

    const data = await response.json();

    if (!data || !data.display_name) {
      return null;
    }

    return data.display_name;
  } catch (error) {
    console.error("Lỗi reverse geocoding:", error);
    return null;
  }
}

/**
 * Lấy tọa độ từ địa chỉ merchant và cache vào database
 */
export async function getMerchantCoordinates(
  merchantId: string,
  address: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    const result = await geocodeAddress(address);
    
    if (!result) {
      console.warn(`Không tìm thấy GPS cho merchant ${merchantId}`);
      // Fallback về tọa độ mặc định (HCM center)
      return { lat: 10.8231, lng: 106.6297 };
    }

    console.log(`✅ Tìm thấy GPS cho merchant: ${result.display_name}`);
    return { lat: result.lat, lng: result.lng };
  } catch (error) {
    console.error("Lỗi getMerchantCoordinates:", error);
    return { lat: 10.8231, lng: 106.6297 }; // Fallback
  }
}

/**
 * Lấy tọa độ từ địa chỉ giao hàng
 */
export async function getDeliveryCoordinates(
  deliveryAddress: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    const result = await geocodeAddress(deliveryAddress);
    
    if (!result) {
      console.warn(`Không tìm thấy GPS cho địa chỉ: ${deliveryAddress}`);
      // Fallback về tọa độ mặc định
      return { lat: 10.7756, lng: 106.7004 };
    }

    console.log(`✅ Tìm thấy GPS giao hàng: ${result.display_name}`);
    return { lat: result.lat, lng: result.lng };
  } catch (error) {
    console.error("Lỗi getDeliveryCoordinates:", error);
    return { lat: 10.7756, lng: 106.7004 }; // Fallback
  }
}
