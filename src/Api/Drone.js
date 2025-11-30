import { supabase } from "./supabase";

/**
 * Get all drones
 * @returns {Promise<Array>}
 */
export async function getDrones() {
    const { data, error } = await supabase
        .from("drone")
        .select("*")
        .order("model", { ascending: true });

    if (error) throw error;
    return data || [];
}

/**
 * Get available (idle) drones
 * @returns {Promise<Array>}
 */
export async function getAvailableDrones() {
    const { data, error } = await supabase
        .from("drone")
        .select("*")
        .eq("status", "idle")
        .gt("battery", 20); // Ensure battery is sufficient

    if (error) throw error;
    return data || [];
}

/**
 * Create a new drone
 * @param {Object} droneData
 * @returns {Promise<Object>}
 */
export async function createDrone(droneData) {
    const { data, error } = await supabase
        .from("drone")
        .insert([droneData])
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Update a drone
 * @param {string} droneId
 * @param {Object} droneData
 * @returns {Promise<Object>}
 */
export async function updateDrone(droneId, droneData) {
    const { data, error } = await supabase
        .from("drone")
        .update(droneData)
        .eq("drone_id", droneId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Delete a drone
 * @param {string} droneId
 * @returns {Promise<void>}
 */
export async function deleteDrone(droneId) {
    const { error } = await supabase.from("drone").delete().eq("drone_id", droneId);
    if (error) throw error;
}
