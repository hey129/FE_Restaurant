import classNames from "classnames/bind";
import { useState, useEffect } from "react";
import styles from "./OverviewTab.module.scss";
import {
  getMerchants,
  getAllProducts,
  getAllCategories,
  getCustomers,
  getAllOrdersAdmin,
} from "~/Api";

const cx = classNames.bind(styles);

const formatVND = (n) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Math.round(Number(n) || 0));

function OverviewTab() {
  // Local state for stats
  const [stats, setStats] = useState({
    totalMerchants: 0,
    totalProducts: 0,
    totalCategories: 0,
    totalCustomers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    PendingOrders: 0,
    CompletedOrders: 0,
    momoOrders: 0,
  });

  // Load all data and calculate stats on mount
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [merchants, products, categories, customers, orders] =
        await Promise.all([
          getMerchants(),
          getAllProducts(),
          getAllCategories(),
          getCustomers(),
          getAllOrdersAdmin(),
        ]);

      let totalRevenue = 0;
      let pendingCount = 0;
      let completedCount = 0;
      let momoCount = 0;

      (orders || []).forEach((order) => {
        totalRevenue += order.total_amount || 0;
        if (order.order_status === "pending") pendingCount++;
        if (order.order_status === "completed") completedCount++;
        if (order.payment?.[0]?.method?.toLowerCase() === "momo") momoCount++;
      });

      setStats({
        totalMerchants: merchants?.length || 0,
        totalProducts: products?.length || 0,
        totalCategories: categories?.length || 0,
        totalCustomers: customers?.length || 0,
        totalOrders: orders?.length || 0,
        totalRevenue,
        PendingOrders: pendingCount,
        CompletedOrders: completedCount,
        momoOrders: momoCount,
      });
    } catch (err) {
      console.error("Load stats error:", err);
    }
  };
  return (
    <div className={cx("overview")}>
      <div className={cx("stats-grid")}>
        <div className={cx("stat-card")}>
          <div className={cx("stat-content")}>
            <h3 className={cx("stat-label")}>Total Merchants</h3>
            <p className={cx("stat-value")}>{stats.totalMerchants || 0}</p>
          </div>
        </div>

        <div className={cx("stat-card")}>
          <div className={cx("stat-content")}>
            <h3 className={cx("stat-label")}>Total Products</h3>
            <p className={cx("stat-value")}>{stats.totalProducts || 0}</p>
          </div>
        </div>

        <div className={cx("stat-card")}>
          <div className={cx("stat-content")}>
            <h3 className={cx("stat-label")}>Total Categories</h3>
            <p className={cx("stat-value")}>{stats.totalCategories || 0}</p>
          </div>
        </div>

        <div className={cx("stat-card")}>
          <div className={cx("stat-content")}>
            <h3 className={cx("stat-label")}>Total Orders</h3>
            <p className={cx("stat-value")}>{stats.totalOrders || 0}</p>
          </div>
        </div>

        <div className={cx("stat-card", "highlight")}>
          <div className={cx("stat-content")}>
            <h3 className={cx("stat-label")}>Total Revenue</h3>
            <p className={cx("stat-value")}>
              {formatVND(stats.totalRevenue || 0)}
            </p>
          </div>
        </div>

        <div className={cx("stat-card")}>
          <div className={cx("stat-content")}>
            <h3 className={cx("stat-label")}>Pending Orders</h3>
            <p className={cx("stat-value")}>{stats.PendingOrders || 0}</p>
          </div>
        </div>

        <div className={cx("stat-card")}>
          <div className={cx("stat-content")}>
            <h3 className={cx("stat-label")}>Completed Orders</h3>
            <p className={cx("stat-value")}>{stats.CompletedOrders || 0}</p>
          </div>
        </div>

        <div className={cx("stat-card")}>
          <div className={cx("stat-content")}>
            <h3 className={cx("stat-label")}>MoMo Orders</h3>
            <p className={cx("stat-value")}>{stats.momoOrders || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OverviewTab;
