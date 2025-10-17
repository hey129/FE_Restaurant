// src/Layout/Components/Customer/AllOrders/index.js
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import classNames from "classnames/bind";
import styles from "./Orders.module.scss";
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
  const statusMap = {
    pending: "Chờ xác nhận",
    processing: "Đang xử lý",
    shipping: "Đang giao hàng",
    delivered: "Đã giao hàng",
    cancelled: "Đã hủy",
  };
  return statusMap[status] || status;
};

const getStatusColor = (status) => {
  const colorMap = {
    pending: "warning",
    processing: "info",
    shipping: "primary",
    delivered: "success",
    cancelled: "danger",
  };
  return colorMap[status] || "default";
};

function Orders() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadOrders() {
      if (!isAuthenticated || !user?.customer_id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        // Get ALL orders (no status filter)
        const data = await getOrders({
          customerId: user.customer_id,
          statuses: [], // Empty array means all statuses
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
  }, [user, isAuthenticated]);

  const handleOrderClick = (orderId) => {
    navigate(`/order/${orderId}`);
  };

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
        <h2>Tất cả đơn hàng</h2>
        <p>Đang tải...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cx("container")}>
        <h2>Tất cả đơn hàng</h2>
        <p className={cx("error")}>{error}</p>
      </div>
    );
  }

  return (
    <div className={cx("container")}>
      <h2 className={cx("title")}>Tất cả đơn hàng</h2>

      {orders.length === 0 ? (
        <div className={cx("empty")}>
          <p>Bạn chưa có đơn hàng nào</p>
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
                    <span className={cx("label")}>Trạng thái thanh toán:</span>
                    <span
                      className={cx(
                        "value",
                        order.payment_status === "paid" ? "paid" : "unpaid"
                      )}
                    >
                      {order.payment_status === "paid"
                        ? "Đã thanh toán"
                        : "Chưa thanh toán"}
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

export default Orders;
