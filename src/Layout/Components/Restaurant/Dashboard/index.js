import { useState } from "react";
import classNames from "classnames/bind";
import styles from "./Dashboard.module.scss";
import { useAuth } from "~/Api";

import OrderList from "../OrderList";
import ProductManagement from "../ProductManagement";
import CategoryManagement from "../CategoryManagement";
import ProfileSettings from "../ProfileSettings";

const cx = classNames.bind(styles);

function RestaurantDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("orders");

  return (
    <div className={cx("dashboard")}>
      {/* Navigation Tabs */}
      <nav className={cx("nav-tabs")}>
        <button
          className={cx("nav-tab", { active: activeTab === "orders" })}
          onClick={() => setActiveTab("orders")}
        >
          Orders
        </button>
        <button
          className={cx("nav-tab", { active: activeTab === "products" })}
          onClick={() => setActiveTab("products")}
        >
          Products
        </button>
        <button
          className={cx("nav-tab", { active: activeTab === "categories" })}
          onClick={() => setActiveTab("categories")}
        >
          Categories
        </button>
        <button
          className={cx("nav-tab", { active: activeTab === "profile" })}
          onClick={() => setActiveTab("profile")}
        >
          Profile
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
