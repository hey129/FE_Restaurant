// src/Pages/Customer/OrderDetail/index.js
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import classNames from "classnames/bind";
import styles from "./OrderDetail.module.scss";
import { useAuth, getOrderDetail, cancelOrder } from "~/Api";
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
    second: "2-digit",
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

function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadOrderDetail() {
      if (!isAuthenticated || !user?.customer_id) {
        navigate("/login");
        return;
      }

      if (!id) {
        navigate("/profile/order");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getOrderDetail({ orderId: Number(id) });

        if (!active) return;

        // Verify this order belongs to the logged-in user
        if (data.customer_id !== user.customer_id) {
          toast.error("Bạn không có quyền xem đơn hàng này");
          navigate("/profile/order");
          return;
        }

        setOrder(data);
      } catch (err) {
        if (!active) return;
        console.error("Load order detail error:", err);
        setError(err.message || "Không thể tải chi tiết đơn hàng");
        toast.error("Không thể tải chi tiết đơn hàng");
      } finally {
        if (!active) return;
        setLoading(false);
      }
    }

    loadOrderDetail();

    return () => {
      active = false;
    };
  }, [id, user, isAuthenticated, navigate]);

  const handleBack = () => {
    navigate("/profile/onprocessorder");
  };

  const handleCancelOrder = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
      return;
    }

    try {
      setCancelling(true);
      await cancelOrder({ orderId: order.order_id });
      toast.success("Đơn hàng đã được hủy thành công");

      // Update local state
      setOrder((prev) => ({ ...prev, order_status: "Đã hủy" }));
    } catch (err) {
      console.error("Cancel order error:", err);
      toast.error(err.message || "Không thể hủy đơn hàng");
    } finally {
      setCancelling(false);
    }
  };

  // Check if order can be cancelled (pending, processing, or shipping status)
  const canCancelOrder =
    order &&
    ["Chờ xử lý", "Đang xử lý", "Đang giao"].includes(order.order_status);

  if (loading) {
    return (
      <div className={cx("container")}>
        <div className={cx("loading")}>
          <p>Đang tải chi tiết đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className={cx("container")}>
        <div className={cx("error-container")}>
          <p className={cx("error")}>{error || "Không tìm thấy đơn hàng"}</p>
          <button className={cx("btn-back")} onClick={handleBack}>
            Quay lại danh sách đơn hàng
          </button>
        </div>
      </div>
    );
  }

  const itemsSubtotal = order.items.reduce(
    (sum, item) => sum + item.subtotal,
    0
  );
  const shippingFee = order.total_amount - itemsSubtotal;

  return (
    <div className={cx("container")}>
      <div className={cx("header")}>
        <h1 className={cx("title")}>Chi tiết đơn hàng #{order.order_id}</h1>
      </div>

      <div className={cx("content")}>
        {/* Order Status Card */}
        <div className={cx("card", "status-card")}>
          <div className={cx("card-header")}>
            <h3>Trạng thái đơn hàng</h3>
            <span
              className={cx("status-badge", getStatusColor(order.order_status))}
            >
              {getStatusText(order.order_status)}
            </span>
          </div>
          <div className={cx("card-body")}>
            <div className={cx("info-row")}>
              <span className={cx("label")}>Ngày đặt hàng:</span>
              <span className={cx("value")}>
                {formatDate(order.order_date)}
              </span>
            </div>
            <div className={cx("info-row")}>
              <span className={cx("label")}>Trạng thái thanh toán:</span>
              <span
                className={cx(
                  "value",
                  order.payment_status === "Đã thanh toán" ? "paid" : "unpaid"
                )}
              >
                {order.payment_status === "Đã thanh toán"
                  ? "Đã thanh toán"
                  : "Chưa thanh toán"}
              </span>
            </div>
            <div className={cx("info-row")}>
              <span className={cx("label")}>Phương thức thanh toán:</span>
              <span className={cx("value")}>
                {order.payment?.[0]?.method?.toLowerCase() === "momo"
                  ? "💳 MoMo"
                  : order.payment?.[0]?.method?.toLowerCase() === "cod"
                  ? "💵 Thanh toán khi nhận hàng (COD)"
                  : order.payment?.[0]?.method || "Chưa xác định"}
              </span>
            </div>
            {order.payment?.[0]?.transaction_id && (
              <div className={cx("info-row")}>
                <span className={cx("label")}>Mã giao dịch:</span>
                <span className={cx("value", "transaction-id")}>
                  {order.payment[0].transaction_id}
                </span>
              </div>
            )}

            {/* Cancel Button */}
            {canCancelOrder && (
              <div className={cx("cancel-section")}>
                <button
                  className={cx("btn-cancel")}
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                >
                  {cancelling ? "Đang hủy..." : "Hủy đơn hàng"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Delivery Info Card */}
        <div className={cx("card")}>
          <div className={cx("card-header")}>
            <h3>Thông tin giao hàng</h3>
          </div>
          <div className={cx("card-body")}>
            <div className={cx("info-row")}>
              <span className={cx("label")}>Địa chỉ:</span>
              <span className={cx("value")}>
                {order.delivery_address || "Chưa cập nhật"}
              </span>
            </div>
            {order.note && (
              <div className={cx("info-row")}>
                <span className={cx("label")}>Ghi chú:</span>
                <span className={cx("value")}>{order.note}</span>
              </div>
            )}
          </div>
        </div>

        {/* Order Items Card */}
        <div className={cx("card", "items-card")}>
          <div className={cx("card-header")}>
            <h3>Sản phẩm ({order.items.length})</h3>
          </div>
          <div className={cx("card-body")}>
            <div className={cx("items-list")}>
              {order.items.map((item) => (
                <div key={item.id} className={cx("item")}>
                  <div className={cx("item-image")}>
                    <img
                      src={
                        item.image ||
                        "https://placehold.co/100x100?text=No+Image"
                      }
                      alt={item.name}
                    />
                  </div>
                  <div className={cx("item-info")}>
                    <h4 className={cx("item-name")}>{item.name}</h4>
                    <div className={cx("item-details")}>
                      <span className={cx("item-price")}>
                        {formatVND(item.price)}
                      </span>
                      <span className={cx("item-quantity")}>
                        x {item.quantity}
                      </span>
                    </div>
                  </div>
                  <div className={cx("item-total")}>
                    {formatVND(item.subtotal)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary Card */}
        <div className={cx("card", "summary-card")}>
          <div className={cx("card-header")}>
            <h3>Tóm tắt đơn hàng</h3>
          </div>
          <div className={cx("card-body")}>
            <div className={cx("summary-row")}>
              <span className={cx("label")}>Tạm tính:</span>
              <span className={cx("value")}>{formatVND(itemsSubtotal)}</span>
            </div>
            <div className={cx("summary-row")}>
              <span className={cx("label")}>Phí vận chuyển:</span>
              <span className={cx("value")}>{formatVND(shippingFee)}</span>
            </div>
            <div className={cx("summary-row", "total")}>
              <span className={cx("label")}>Tổng cộng:</span>
              <span className={cx("value")}>
                {formatVND(order.total_amount)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;
