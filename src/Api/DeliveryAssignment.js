import { supabase } from "./supabase";
import { getAvailableDrones, updateDrone } from "./Drone";
import { updateOrderStatus } from "./Order";

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

/**
 * Assign an available drone to an order
 * @param {number} orderId
 * @returns {Promise<Object>} Assignment details
 */
export async function assignAvailableDrone(orderId) {
    // 1. Find an available drone
    const availableDrones = await getAvailableDrones();

    if (availableDrones.length === 0) {
        throw new Error("NO_DRONE_AVAILABLE");
    }

    // Simple strategy: pick the first one (can be improved to pick closest or highest battery)
    const drone = availableDrones[0];

    // Fetch order and merchant details to get addresses
    const { data: order, error: orderErr } = await supabase
        .from("orders")
        .select("delivery_address, merchant_id")
        .eq("order_id", orderId)
        .single();

    if (orderErr) throw orderErr;

    const { data: merchant, error: merchantErr } = await supabase
        .from("merchant")
        .select("address")
        .eq("merchant_id", order.merchant_id)
        .single();

    if (merchantErr) throw merchantErr;

    // Geocode addresses
    const [pickupCoords, dropCoords] = await Promise.all([
        geocodeAddress(merchant.address),
        geocodeAddress(order.delivery_address)
    ]);

    const pickup_lat = pickupCoords ? pickupCoords.lat : 0;
    const pickup_lng = pickupCoords ? pickupCoords.lng : 0;
    const drop_lat = dropCoords ? dropCoords.lat : 0;
    const drop_lng = dropCoords ? dropCoords.lng : 0;

    // 2. Create delivery assignment
    const { data: assignment, error: assignError } = await supabase
        .from("delivery_assignment")
        .insert({
            order_id: orderId,
            drone_id: drone.drone_id,
            status: "assigned",
            pickup_lat,
            pickup_lng,
            drop_lat,
            drop_lng,
        })
        .select()
        .single();

    if (assignError) throw assignError;

    // 3. Update drone status to 'delivering' and set current location to pickup point
    await updateDrone(drone.drone_id, {
        status: "delivering",
        current_lat: pickup_lat,
        current_lng: pickup_lng
    });

    // 4. Update order status to 'Shipping'
    await updateOrderStatus({
        orderId,
        orderStatus: "Shipping",
    });

    return {
        assignment,
        drone,
    };
}

/**
 * Get delivery assignment for an order
 * @param {number} orderId
 * @returns {Promise<Object>}
 */
export async function getAssignmentByOrderId(orderId) {
    const { data, error } = await supabase
        .from("delivery_assignment")
        .select(`
      *,
      drone (*)
    `)
        .eq("order_id", orderId)
        .single();

    if (error && error.code !== "PGRST116") { // Ignore not found error
        throw error;
    }

    return data || null;
}
