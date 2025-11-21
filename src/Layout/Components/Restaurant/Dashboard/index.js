import { useState } from "react";
import classNames from "classnames/bind";
import styles from "./Dashboard.module.scss";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "~/Api";

import OrderList from "../OrderList";
import ProductManagement from "../ProductManagement";
import CategoryManagement from "../CategoryManagement";
import ProfileSettings from "../ProfileSettings";

const cx = classNames.bind(styles);

function RestaurantDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("orders");

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return (
    <div className={cx("dashboard")}>
      <Toaster position="top-right" />

      {/* Header */}
      <header className={cx("header")}>
        <div className={cx("header-left")}>
          <h1 className={cx("logo")}>🍽️ Restaurant Manager</h1>
          <p className={cx("subtitle")}>
            {user?.merchant_name || "Restaurant"}
          </p>
        </div>
        <div className={cx("header-right")}>
          <span className={cx("email")}>{user?.email}</span>
          <button className={cx("btn-logout")} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className={cx("nav-tabs")}>
        <button
          className={cx("nav-tab", { active: activeTab === "orders" })}
          onClick={() => setActiveTab("orders")}
        >
          📋 Orders
        </button>
        <button
          className={cx("nav-tab", { active: activeTab === "products" })}
          onClick={() => setActiveTab("products")}
        >
          📦 Products
        </button>
        <button
          className={cx("nav-tab", { active: activeTab === "categories" })}
          onClick={() => setActiveTab("categories")}
        >
          📂 Categories
        </button>
        <button
          className={cx("nav-tab", { active: activeTab === "profile" })}
          onClick={() => setActiveTab("profile")}
        >
          ⚙️ Profile
        </button>
      </nav>

      {/* Content Area */}
      <main className={cx("content")}>
        {activeTab === "orders" && <OrderList merchant={user} />}
        {activeTab === "products" && <ProductManagement merchant={user} />}
        {activeTab === "categories" && <CategoryManagement merchant={user} />}
        {activeTab === "profile" && <ProfileSettings merchant={user} />}
      </main>
    </div>
  );
}

export default RestaurantDashboard;
