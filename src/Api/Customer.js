// ~/Api/Customer.js
import { supabase } from "./supabase";

export async function registerCustomer({
  email,
  password,
  customer_name,
  phone,
  address,
}) {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          customer_name,
          phone,
          address,
        },
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("Failed to create user account");

    const { error: insertError } = await supabase.from("customer").insert({
      customer_id: authData.user.id,
      customer_name,
      phone: phone || null,
      address: address || null,
    });

    if (insertError) {
      console.error("Profile creation failed:", insertError);
      throw insertError;
    }

    return {
      success: true,
      user: authData.user,
      session: authData.session, // <-- Trả về session
      message: "Registration successful!", // <-- Thay đổi thông báo
    };
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
}

export async function loginCustomer({ email, password }) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error("Login failed");

    const { data: profile, error: profileError } = await supabase
      .from("customer")
      .select("customer_id, customer_name, phone, address, created_at")
      .eq("customer_id", data.user.id)
      .single();

    if (profileError) {
      console.warn("Could not fetch customer profile:", profileError);
    }

    return {
      success: true,
      user: data.user,
      session: data.session,
      profile: profile || null,
    };
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

export async function logoutCustomer() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;

    if (!user) return null;

    const { data: profile, error: profileError } = await supabase
      .from("customer")
      .select("customer_id, customer_name, phone, address, created_at")
      .eq("customer_id", user.id)
      .single();

    if (profileError) {
      console.warn("Could not fetch customer profile:", profileError);
    }

    return {
      user,
      profile: profile || null,
    };
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
}

export async function getCustomerProfile(customerId) {
  try {
    const { data, error } = await supabase
      .from("customer")
      .select("customer_id, customer_name, phone, address, created_at")
      .eq("customer_id", customerId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Get customer profile error:", error);
    throw error;
  }
}

export async function updateCustomerProfile(customerId, updates) {
  try {
    const allowedFields = ["customer_name", "phone", "address"];
    const filteredUpdates = Object.keys(updates)
      .filter((key) => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    const { data, error } = await supabase
      .from("customer")
      .update(filteredUpdates)
      .eq("customer_id", customerId)
      .select("customer_id, customer_name, phone, address, created_at")
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Update customer profile error:", error);
    throw error;
  }
}

export async function getCustomers() {
  try {
    const { data, error } = await supabase
      .from("customer")
      .select("customer_id, customer_name, phone, address, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Get customers error:", error);
    return [];
  }
}
