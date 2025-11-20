// Customer.js (sửa trực tiếp thành Context Provider, tích hợp API functions)
import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "./supabase"; // Import supabase client

const CustomerContext = createContext();

export function CustomerProvider({ children }) {
  const [customer, setCustomer] = useState(null); // Profile của customer hiện tại
  const [customers, setCustomers] = useState([]); // List all customers (if needed for admin)
  const [loading, setLoading] = useState(true);

  // Shared function to get current user and profile
  const getCurrentUser = async () => {
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
        // Profile might not exist yet for new users
      }

      return {
        user,
        profile: profile || null,
      };
    } catch (error) {
      return null;
    }
  };

  // Kiểm tra và load profile customer hiện tại khi component mount
  useEffect(() => {
    async function loadCustomer() {
      try {
        const userData = await getCurrentUser();

        if (!userData || !userData.user) {
          setCustomer(null);
          setCustomers([]);
          setLoading(false);
          return;
        }

        setCustomer(userData.profile || null);

        // Load list customers nếu cần (ví dụ: cho admin panel)
        const { data: allCustomers, error: customersError } = await supabase
          .from("customer")
          .select("customer_id, customer_name, phone, address, created_at")
          .order("created_at", { ascending: false });

        if (customersError) throw customersError;
        setCustomers(allCustomers || []);
      } catch (error) {
        setCustomer(null);
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    }
    loadCustomer();
  }, []);

  // Hàm register customer (tương tự login trong Auth)
  const register = async ({
    email,
    password,
    customer_name,
    phone,
    address,
  }) => {
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
        throw insertError;
      }

      // Update state after successful registration
      setCustomer({
        customer_id: authData.user.id,
        customer_name,
        phone: phone || null,
        address: address || null,
      });

      return {
        success: true,
        user: authData.user,
        session: authData.session,
        message: "Registration successful!",
      };
    } catch (error) {
      throw error;
    }
  };

  const loginCustomer = async ({ email, password }) => {
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
        // Profile might not exist
      }

      return {
        success: true,
        user: data.user,
        session: data.session,
        profile: profile || null,
      };
    } catch (error) {
      throw error;
    }
  };

  const logoutCustomer = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  // Update profile function (added to manage customer)
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
      .select("customer_id, customer_name, phone, address, created_at")
      .single();

    if (error) throw error;
    setCustomer(data);
    return data;
  };

  // Hàm refresh list customers
  const refreshCustomers = async () => {
    const { data, error } = await supabase
      .from("customer")
      .select("customer_id, customer_name, phone, address, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;
    setCustomers(data || []);
    return data || [];
  };

  const value = {
    customer, // Profile hiện tại
    customers, // List customers
    isLoading: loading,
    loginCustomer,
    logoutCustomer,
    register, // Tương tự login
    updateProfile,
    getCurrentUser,
    refreshCustomers,
  };

  return (
    <CustomerContext.Provider value={value}>
      {!loading && children}
    </CustomerContext.Provider>
  );
}

// Custom hook để sử dụng context (tương tự useAuth)
export function useCustomer() {
  return useContext(CustomerContext);
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
    return [];
  }
}
