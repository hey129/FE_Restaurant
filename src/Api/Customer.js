// Customer.js - Customer profile management (works with unified Auth)
import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "./supabase";

const CustomerContext = createContext();

// ============ PROFILE MANAGEMENT FUNCTIONS ============

/**
 * Get current customer profile from auth session
 */
export async function getCurrentUserFn() {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData?.session;

    if (!session?.user) return null;

    const { data: profile } = await supabase
      .from("customer")
      .select(
        "customer_id, customer_name, email, phone, address, status, created_at"
      )
      .eq("customer_id", session.user.id)
      .maybeSingle();

    return {
      user: session.user,
      profile: profile || null,
    };
  } catch (error) {
    console.error("Error getting current customer:", error);
    return null;
  }
}

/**
 * Register a new customer
 */
export async function registerFn({
  email,
  password,
  customer_name,
  phone,
  address,
}) {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("Failed to create user account");

    // Create customer profile
    const { data: profile, error: insertError } = await supabase
      .from("customer")
      .insert({
        customer_id: authData.user.id,
        customer_name,
        email,
        phone: phone || null,
        address: address || null,
        status: true,
      })
      .select(
        "customer_id, customer_name, email, phone, address, status, created_at"
      )
      .single();

    if (insertError) throw insertError;

    return {
      success: true,
      user: authData.user,
      profile,
      message: "Registration successful! Please verify your email.",
    };
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
}

// ============ CONTEXT PROVIDER ============

export function CustomerProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCustomer() {
      try {
        const userData = await getCurrentUserFn();
        if (userData?.profile) {
          setCustomer(userData.profile);
        }
      } catch (error) {
        console.error("Error loading customer:", error);
      } finally {
        setLoading(false);
      }
    }
    loadCustomer();
  }, []);

  const updateProfile = async (updates) => {
    if (!customer) throw new Error("No customer profile available");
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
      .eq("customer_id", customer.customer_id)
      .select(
        "customer_id, customer_name, email, phone, address, status, created_at"
      )
      .single();

    if (error) throw error;
    setCustomer(data);
    return data;
  };

  const value = {
    customer,
    isLoading: loading,
    updateProfile,
    getCurrentUser: getCurrentUserFn,
    register: registerFn,
  };

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  return useContext(CustomerContext);
}

export async function getCustomers() {
  try {
    const { data, error } = await supabase
      .from("customer")
      .select(
        "customer_id, customer_name, email, phone, address, status, created_at"
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Get customers error:", error);
    return [];
  }
}
