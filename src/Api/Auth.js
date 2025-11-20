import { createContext, useContext, useState, useEffect } from "react";
import { useCustomer } from "./Customer";
import { supabase } from "./supabase"; // Import supabase client

export const AUTH_REQUIRED = "AUTH_REQUIRED";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { loginCustomer, logoutCustomer, getCurrentUser } = useCustomer();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [merchantId, setMerchantId] = useState(null); // Track current merchant

  // Kiểm tra xem có user nào đang đăng nhập không khi app khởi động
  useEffect(() => {
    async function checkUser() {
      const data = await getCurrentUser();
      const profile = data?.profile || null;
      setUser(profile);
      
      // Initialize merchant context if available
      if (profile?.merchant_id) {
        setMerchantId(profile.merchant_id);
      }
      setLoading(false);
    }
    checkUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getCurrentUser]);

  // Login function will call API, then update global user state
  const login = async ({ email, password }) => {
    const data = await loginCustomer({ email, password });
    setUser(data.profile);
    
    // Set merchant context from profile
    if (data.profile?.merchant_id) {
      setMerchantId(data.profile.merchant_id);
    }
    return data;
  };

  const logout = async () => {
    await logoutCustomer();
    setUser(null);
    setMerchantId(null);
  };

  // Allow switching merchant context (for admins or cross-merchant users)
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
    isAuthenticated: !!user, // true nếu user tồn tại, ngược lại là false
    login,
    logout,
    changePassword,
    switchMerchant,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Tạo một custom hook để dễ dàng sử dụng context
export function useAuth() {
  return useContext(AuthContext);
}
