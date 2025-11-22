import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "./supabase";

export const AUTH_REQUIRED = "AUTH_REQUIRED";

const AuthContext = createContext();

/**
 * Get current user from session and determine if customer or merchant
 */
async function getCurrentUserFn() {
  try {
    // Get session from single Supabase client
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData?.session;

    if (!session?.user) {
      console.log("❌ No session found");
      return { profile: null, client: null };
    }

    const authUserId = session.user.id;
    console.log("🔍 Found session, auth user ID:", authUserId);

    // Try to find as customer first
    const { data: customerData } = await supabase
      .from("customer")
      .select("customer_id, customer_name, phone, address, status, email")
      .eq("customer_id", authUserId)
      .maybeSingle();

    if (customerData) {
      console.log("✅ User is customer:", customerData.customer_name);
      return {
        user: session.user,
        profile: {
          ...customerData,
          userType: "customer",
        },
        client: "customer",
      };
    }

    // Try to find as merchant
    const { data: merchantData } = await supabase
      .from("merchant")
      .select(
        "merchant_id, merchant_name, email, phone, address, status, user_id"
      )
      .eq("user_id", authUserId)
      .maybeSingle();

    if (merchantData) {
      console.log("✅ User is merchant:", merchantData.merchant_name);
      return {
        user: session.user,
        profile: {
          ...merchantData,
          userType: "merchant",
        },
        client: "merchant",
      };
    }

    // User exists in auth but no profile - create basic profile
    console.log("⚠️ User has no profile, creating fallback");
    return {
      user: session.user,
      profile: {
        customer_id: authUserId,
        customer_name: session.user.email?.split("@")[0] || "User",
        email: session.user.email || "",
        phone: null,
        address: null,
        status: true,
        userType: "customer",
      },
      client: "customer",
    };
  } catch (error) {
    console.error("❌ Get current user error:", error);
    return { profile: null, client: null };
  }
}

/**
 * Login customer
 */
async function loginCustomerFn({ email, password }) {
  try {
    // Authenticate with Supabase
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) throw authError;
    if (!authData.user) throw new Error("Authentication failed");

    console.log("✅ Auth successful for customer:", email);
    const authUserId = authData.user.id;

    // Find in customer table
    const { data: customerData } = await supabase
      .from("customer")
      .select("customer_id, customer_name, email, phone, address, status")
      .eq("customer_id", authUserId)
      .maybeSingle();

    if (customerData) {
      console.log("✅ Found customer profile:", customerData.customer_name);
      return {
        user: authData.user,
        profile: {
          ...customerData,
          userType: "customer",
        },
        client: "customer",
      };
    }

    throw new Error(`Customer profile not found for ${email}`);
  } catch (error) {
    console.error("❌ Customer login error:", error.message);
    throw error;
  }
}

/**
 * Login restaurant (merchant)
 */
async function loginRestaurantFn({ email, password }) {
  try {
    // Authenticate with Supabase
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) throw authError;
    if (!authData.user) throw new Error("Authentication failed");

    console.log("✅ Auth successful for restaurant:", email);
    const authUserId = authData.user.id;

    // Find in merchant table
    const { data: merchantData } = await supabase
      .from("merchant")
      .select(
        "merchant_id, merchant_name, email, phone, address, status, user_id"
      )
      .eq("user_id", authUserId)
      .maybeSingle();

    if (merchantData) {
      console.log("✅ Found merchant profile:", merchantData.merchant_name);
      return {
        user: authData.user,
        profile: {
          ...merchantData,
          userType: "merchant",
        },
        client: "merchant",
      };
    }

    throw new Error(`Restaurant profile not found for ${email}`);
  } catch (error) {
    console.error("❌ Restaurant login error:", error.message);
    throw error;
  }
}

/**
 * Login user (customer or merchant)
 */
async function loginUserFn({ email, password, userType = null }) {
  try {
    // Authenticate with Supabase
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) throw authError;
    if (!authData.user) throw new Error("Authentication failed");

    console.log(
      "✅ Auth successful for:",
      email,
      "as",
      userType || "auto-detect"
    );
    const authUserId = authData.user.id;

    // Try to find in customer table
    const { data: customerData } = await supabase
      .from("customer")
      .select("customer_id, customer_name, email, phone, address, status")
      .eq("customer_id", authUserId)
      .maybeSingle();

    if (customerData) {
      console.log("✅ Found customer profile:", customerData.customer_name);
      return {
        user: authData.user,
        profile: {
          ...customerData,
          userType: "customer",
        },
        client: "customer",
      };
    }

    // Try to find in merchant table
    const { data: merchantData } = await supabase
      .from("merchant")
      .select(
        "merchant_id, merchant_name, email, phone, address, status, user_id"
      )
      .eq("user_id", authUserId)
      .maybeSingle();

    if (merchantData) {
      console.log("✅ Found merchant profile:", merchantData.merchant_name);
      return {
        user: authData.user,
        profile: {
          ...merchantData,
          userType: "merchant",
        },
        client: "merchant",
      };
    }

    throw new Error(`User profile not found for ${email}`);
  } catch (error) {
    console.error("❌ Login error:", error.message);
    throw error;
  }
}

/**
 * Logout user
 */
async function logoutUserFn() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [merchantId, setMerchantId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function checkUser() {
      try {
        console.log("🔄 Checking auth state...");
        const data = await getCurrentUserFn();

        if (isMounted) {
          if (data?.profile) {
            console.log("✅ Auth state restored:", data.profile.userType);
            setUser(data.profile);
            if (data.profile.userType === "merchant") {
              setMerchantId(data.profile.merchant_id);
            }
          } else {
            console.log("❌ No auth state found");
            setUser(null);
            setMerchantId(null);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error("Error checking user:", error);
        if (isMounted) {
          setUser(null);
          setMerchantId(null);
          setLoading(false);
        }
      }
    }

    checkUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async ({ email, password }) => {
    try {
      const data = await loginUserFn({ email, password });
      setUser(data.profile);

      // Set merchantId based on user type
      if (data.profile.userType === "merchant") {
        setMerchantId(data.profile.merchant_id);
      }

      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const loginCustomer = async ({ email, password }) => {
    try {
      const data = await loginCustomerFn({ email, password });
      setUser(data.profile);
      return data;
    } catch (error) {
      console.error("Customer login error:", error);
      throw error;
    }
  };

  const loginRestaurant = async ({ email, password }) => {
    try {
      const data = await loginRestaurantFn({ email, password });
      setUser(data.profile);
      if (data.profile.userType === "merchant") {
        setMerchantId(data.profile.merchant_id);
      }
      return data;
    } catch (error) {
      console.error("Restaurant login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutUserFn();
      setUser(null);
      setMerchantId(null);
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear state even if error
      setUser(null);
      setMerchantId(null);
    }
  };

  const switchMerchant = (newMerchantId) => {
    setMerchantId(newMerchantId);
  };

  const changePassword = async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
    return data;
  };

  const value = {
    user,
    merchantId,
    userType: user?.userType,
    isAuthenticated: !!user,
    isMerchant: user?.userType === "merchant",
    isCustomer: user?.userType === "customer",
    login,
    loginCustomer,
    loginRestaurant,
    logout,
    changePassword,
    switchMerchant,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export { loginCustomerFn, loginRestaurantFn, loginUserFn };
