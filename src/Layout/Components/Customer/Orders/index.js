// src/Layout/Components/Customer/AllOrders/index.js
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import classNames from "classnames/bind";
import styles from "./Orders.module.scss";
import { useAuth } from "~/Api";
import { supabase } from "~/Api/supabase";
import toast from "react-hot-toast";

const cx = classNames.bind(styles);

const formatVND = (n) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Math.round(Number(n) || 0));

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const getStatusText = (status) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const getStatusColor = (status) => {
  const colorMap = {
    Pending: "warning",
    Failed: "danger",
    Shipping: "primary",
    Completed: "success",
    Cancelled: "danger",
  };
  return colorMap[status] || "default";
};

function Orders() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadOrders() {
      if (authLoading) return; // Wait for auth to load
      if (!isAuthenticated || !user?.customer_id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        // Get ALL orders for customer (across all merchants, no status filter)
        // Since we need to load from all merchants, we need to fetch from orders table directly
        // OR we need a getAllOrders API function
        const { data, error: err } = await supabase
          .from("orders")
          .select(
            `
            order_id,
            customer_id,
            merchant_id,
            order_date,
            delivery_address,
            total_amount,
            order_status,
            payment_status,
            note,
            payment:payment!payment_order_id_fkey(method, transaction_id),
            merchant:merchant_id (merchant_id, merchant_name)
          `
          )
          .eq("customer_id", user.customer_id)
          .order("order_date", { ascending: false });

        if (err) throw err;

        if (!active) return;
        setOrders(data || []);
      } catch (err) {
        if (!active) return;
        console.error("Load orders error:", err);
        setError(err.message || "Unable to load orders");
        toast.error("Unable to load orders");
      } finally {
        if (!active) return;
        setLoading(false);
      }
    }

    loadOrders();

    return () => {
      active = false;
    };
  }, [user, isAuthenticated, authLoading]);

  const handleOrderClick = (orderId) => {
    navigate(`/order/${orderId}`);
  };

  if (loading) {
    return (
      <div className={cx("container")}>
        <h2>Loading...</h2>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={cx("container")}>
        <h2>Please login to view orders</h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={cx("container")}>
        <h2>All Orders</h2>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cx("container")}>
        <h2>All Orders</h2>
        <p className={cx("error")}>{error}</p>
      </div>
    );
  }

  return (
    <div className={cx("container")}>
      <h2 className={cx("title")}>All Orders</h2>

      {orders.length === 0 ? (
        <div className={cx("empty")}>
          <p>You don't have any orders yet</p>
        </div>
      ) : (
        <div className={cx("orders-list")}>
          {orders.map((order) => (
            <div
              key={order.order_id}
              className={cx("order-card")}
              onClick={() => handleOrderClick(order.order_id)}
            >
              <div className={cx("order-header")}>
                <div className={cx("order-id")}>
                  <strong>Order #{order.order_id}</strong>
                  {order.merchant?.merchant_name && (
                    <span className={cx("merchant-name")}>
                      {order.merchant.merchant_name}
                    </span>
                  )}
                  <span className={cx("order-date")}>
                    {formatDate(order.order_date)}
                  </span>
                </div>
                <span
                  className={cx(
                    "status-badge",
                    getStatusColor(order.order_status)
                  )}
                >
                  {getStatusText(order.order_status)}
                </span>
              </div>

              <div className={cx("order-body")}>
                <div className={cx("order-info")}>
                  <div className={cx("info-row")}>
                    <span className={cx("label")}>Delivery Address:</span>
                    <span className={cx("value")}>
                      {order.delivery_address || "Not updated"}
                    </span>
                  </div>
                  <div className={cx("info-row")}>
                    <span className={cx("label")}>Payment Status:</span>
                    <span
                      className={cx(
                        "value",
                        order.payment_status === "Paid" ? "Paid" : "refunded"
                      )}
                    >
                      {order.payment_status === "Paid" ? "Paid" : "Refunded"}
                    </span>
                  </div>
                  <div className={cx("info-row")}>
                    <span className={cx("label")}>Payment Method:</span>
                    <span className={cx("value", "payment-method")}>
                      {order.payment?.[0]?.method?.toLowerCase() === "momo"
                        ? "MoMo"
                        : order.payment?.[0]?.method || "N/A"}
                    </span>
                  </div>
                </div>

                <div className={cx("order-total")}>
                  <span className={cx("total-label")}>Total:</span>
                  <span className={cx("total-amount")}>
                    {formatVND(order.total_amount)}
                  </span>
                </div>
              </div>

              <div className={cx("order-footer")}>
                <span className={cx("view-detail")}>View Details</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;
