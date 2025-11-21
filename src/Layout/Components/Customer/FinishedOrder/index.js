// src/Layout/Components/Customer/FinishedOrder/index.js
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import classNames from "classnames/bind";
import styles from "./FinishedOrder.module.scss";
import { useAuth, getOrders } from "~/Api";
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
    Processing: "info",
    shipping: "primary",
    delivered: "success",
    Cancelled: "danger",
  };
  return colorMap[status] || "default";
};

function FinishedOrder() {
  const navigate = useNavigate();
  const { user, isAuthenticated, merchantId } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadOrders() {
      if (loading) return; // Wait for auth to load
      if (!isAuthenticated || !user?.customer_id || !merchantId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        // Get orders with status: delivered, Cancelled
        const data = await getOrders({
          customerId: user.customer_id,
          merchantId,
          statuses: ["delivered", "Cancelled"],
        });

        if (!active) return;
        setOrders(data);
      } catch (err) {
        if (!active) return;
        console.error("Load orders error:", err);
        setError(err.message || "Không thể tải đơn hàng");
        toast.error("Không thể tải đơn hàng");
      } finally {
        if (!active) return;
        setLoading(false);
      }
    }

    loadOrders();

    return () => {
      active = false;
    };
  }, [user, isAuthenticated, merchantId, loading]);

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
        <h2>Vui lòng đăng nhập để xem đơn hàng</h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={cx("container")}>
        <h2>Đơn hàng đã hoàn thành</h2>
        <p>Đang tải...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cx("container")}>
        <h2>Đơn hàng đã hoàn thành</h2>
        <p className={cx("error")}>{error}</p>
      </div>
    );
  }

  return (
    <div className={cx("container")}>
      <h2 className={cx("title")}>Đơn hàng đã hoàn thành</h2>

      {orders.length === 0 ? (
        <div className={cx("empty")}>
          <p>Bạn chưa có đơn hàng nào đã hoàn thành</p>
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
                  <strong>Đơn hàng #{order.order_id}</strong>
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
                    <span className={cx("label")}>Địa chỉ giao hàng:</span>
                    <span className={cx("value")}>
                      {order.delivery_address || "Chưa cập nhật"}
                    </span>
                  </div>
                  <div className={cx("info-row")}>
                    <span className={cx("label")}>Payment Status:</span>
                    <span
                      className={cx(
                        "value",
                        order.payment_status === "Paid" ||
                          order.payment_status === "Paid"
                          ? "Paid"
                          : "refunded"
                      )}
                    >
                      {order.payment_status === "Paid" ||
                      order.payment_status === "Paid"
                        ? "Paid"
                        : "Refunded"}
                    </span>
                  </div>
                  <div className={cx("info-row")}>
                    <span className={cx("label")}>Phương thức:</span>
                    <span className={cx("value", "payment-method")}>
                      {order.payment?.[0]?.method?.toLowerCase() === "momo"
                        ? "💳 MoMo"
                        : order.payment?.[0]?.method?.toLowerCase() === "cod"
                        ? "💵 COD"
                        : order.payment?.[0]?.method || "N/A"}
                    </span>
                  </div>
                </div>

                <div className={cx("order-total")}>
                  <span className={cx("total-label")}>Tổng tiền:</span>
                  <span className={cx("total-amount")}>
                    {formatVND(order.total_amount)}
                  </span>
                </div>
              </div>

              <div className={cx("order-footer")}>
                <span className={cx("view-detail")}>Xem chi tiết →</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FinishedOrder;
