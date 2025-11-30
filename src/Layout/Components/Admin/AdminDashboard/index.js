// Refactored AdminDashboard - chỉ quản lý activeTab và searchTerm
// Mỗi tab component tự quản lý state của nó
import { useState } from "react";
import classNames from "classnames/bind";
import styles from "./AdminDashboard.module.scss";

// Import Tab Components
import OverviewTab from "./OverviewTab";
import MerchantsTab from "./MerchantsTab";
import ProductsTab from "./ProductsTab";
import CategoriesTab from "./CategoriesTab";
import CustomersTab from "./CustomersTab";
import DronesTab from "./DronesTab";
import OrdersTab from "./OrdersTab";
const cx = classNames.bind(styles);

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className={cx("container")}>
      {/* Header */}
      <div className={cx("header")}>
        <h1 className={cx("title")}>Admin Dashboard</h1>
      </div>

      {/* Navigation Tabs */}
      <div className={cx("tabs")}>
        <button
          className={cx("tab", { active: activeTab === "overview" })}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={cx("tab", { active: activeTab === "merchants" })}
          onClick={() => setActiveTab("merchants")}
        >
          Merchants
        </button>
        <button
          className={cx("tab", { active: activeTab === "products" })}
          onClick={() => setActiveTab("products")}
        >
          Products
        </button>
        <button
          className={cx("tab", { active: activeTab === "categories" })}
          onClick={() => setActiveTab("categories")}
        >
          Categories
        </button>
        <button
          className={cx("tab", { active: activeTab === "customers" })}
          onClick={() => setActiveTab("customers")}
        >
          Customers
        </button>
        <button
          className={cx("tab", { active: activeTab === "orders" })}
          onClick={() => setActiveTab("orders")}
        >
          Orders
        </button>
        <button
          className={cx("tab", { active: activeTab === "drones" })}
          onClick={() => setActiveTab("drones")}
        >
          Drones
        </button>
      </div>

      {/* Content Area - Render Tab Components */}
      <div className={cx("content")}>
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "merchants" && <MerchantsTab />}
        {activeTab === "products" && <ProductsTab />}
        {activeTab === "categories" && <CategoriesTab />}
        {activeTab === "customers" && <CustomersTab />}
        {activeTab === "orders" && <OrdersTab />}
        {activeTab === "drones" && <DronesTab />}
      </div>
    </div>
  );
}

export default AdminDashboard;
