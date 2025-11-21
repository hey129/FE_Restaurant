import classNames from "classnames/bind";
import styles from "./RestaurantLayout.module.scss";
import { useAuth } from "~/Api";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const cx = classNames.bind(styles);

function RestaurantLayout({ children }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
      toast.success("Logged out successfully", { duration: 2000 });
    } catch (error) {
      toast.error("Logout failed", { duration: 2000 });
    }
  };

  return (
    <div className={cx("restaurant-layout")}>
      <Toaster
        position="top-right"
        gutter={8}
        toastOptions={{ duration: 2000 }}
      />

      {/* Restaurant Header */}
      <header className={cx("restaurant-header")}>
        <div className={cx("header-left")}>
          <h1 className={cx("header-title")}>Restaurant Manager</h1>
          <p className={cx("header-subtitle")}>
            {user?.merchant_name || "Restaurant"}
          </p>
        </div>
        <div className={cx("header-right")}>
          <span className={cx("user-email")}>{user?.email}</span>
          <button className={cx("logout-btn")} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Content */}
      <div className={cx("content-wrapper")}>{children}</div>
    </div>
  );
}

export default RestaurantLayout;
