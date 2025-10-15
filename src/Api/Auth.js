import { createContext, useContext, useState, useEffect } from "react";
import {
  loginCustomer as apiLogin,
  getCurrentUser,
  logoutCustomer as apiLogout,
} from "./Customer";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Kiểm tra xem có user nào đang đăng nhập không khi app khởi động
  useEffect(() => {
    async function checkUser() {
      const data = await getCurrentUser();
      setUser(data?.profile || null);
      setLoading(false);
    }
    checkUser();
  }, []);

  // Hàm login sẽ gọi API, sau đó cập nhật state user toàn cục
  const login = async ({ email, password }) => {
    const data = await apiLogin({ email, password });
    setUser(data.profile);
    return data;
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user, // true nếu user tồn tại, ngược lại là false
    login,
    logout,
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
