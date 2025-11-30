import { supabase } from "./supabase";
import { getAvailableDrones, updateDrone } from "./Drone";
import { updateOrderStatus } from "./Order";

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

    // 2. Create delivery assignment
    const { data: assignment, error: assignError } = await supabase
        .from("delivery_assignment")
        .insert({
            order_id: orderId,
            drone_id: drone.drone_id,
            status: "assigned",
            pickup_lat: 0, // Placeholder, should come from merchant location
            pickup_lng: 0,
            drop_lat: 0, // Placeholder, should come from customer location
            drop_lng: 0,
        })
        .select()
        .single();

    if (assignError) throw assignError;

    // 3. Update drone status to 'delivering' (or 'busy')
    await updateDrone(drone.drone_id, { status: "delivering" });

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
