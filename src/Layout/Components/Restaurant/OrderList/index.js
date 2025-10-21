// src/Pages/Restaurant/OrderList/index.js
import { useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from "./OrderList.module.scss";
import { getAllOrders, getOrderItems, updateOrderStatus } from "~/Api";
import toast, { Toaster } from "react-hot-toast";

const cx = classNames.bind(styles);

const formatVND = (n) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Math.round(Number(n) || 0));

const formatDate = (dateString) => {
  try {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
};

function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, pending, processing, completed, cancelled
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [processingAction, setProcessingAction] = useState(null);

  // Load orders
  const loadOrders = async () => {
    try {
      setLoading(true);

      const data = await getAllOrders({ status: filter });

      setOrders(data || []);
    } catch (err) {
      console.error("Load orders error:", err);
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // Load order items
  const loadOrderItems = async (orderId) => {
    try {
      const data = await getOrderItems({ orderId });
      return data || [];
    } catch (err) {
      console.error("Load order items error:", err);
      return [];
    }
  };

  // Toggle order expansion
  const toggleOrderExpansion = async (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      const items = await loadOrderItems(orderId);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.order_id === orderId ? { ...order, items } : order
        )
      );
      setExpandedOrder(orderId);
    }
  };

  // Update order status
  const updateOrderStatusLocal = async (
    orderId,
    newStatus,
    refundPayment = false
  ) => {
    try {
      setProcessingAction(orderId);

      // Prepare update params
      const updateParams = {
        orderId,
        orderStatus: newStatus,
      };

      // If cancelling and payment was made, set payment status to refund
      if (newStatus === "Hủy" && refundPayment) {
        updateParams.paymentStatus = "Hoàn tiền";
      }

      // If completing, ensure payment is marked as paid
      if (newStatus === "Hoàn thành") {
        updateParams.paymentStatus = "Đã thanh toán";
      }

      const data = await updateOrderStatus(updateParams);

      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.order_id === orderId ? { ...order, ...data } : order
        )
      );

      const statusText = {
        cancelled: "đã hủy",
        completed: "đã hoàn thành",
      };

      toast.success(`Đơn hàng #${orderId} ${statusText[newStatus]}!`);

      if (refundPayment) {
        toast.success("Trạng thái thanh toán đã được cập nhật thành Hoàn tiền");
      }
    } catch (err) {
      console.error("Update order status error:", err);
      toast.error("Không thể cập nhật trạng thái đơn hàng");
    } finally {
      setProcessingAction(null);
    }
  };

  // Handle cancel order
  const handleCancelOrder = async (order) => {
    const confirmCancel = window.confirm(
      `Bạn có chắc chắn muốn hủy đơn hàng #${order.order_id}?\n\n` +
        `Khách hàng: ${order.customer?.customer_name || "N/A"}\n` +
        `Tổng tiền: ${formatVND(order.total_amount)}\n` +
        `Trạng thái thanh toán: ${order.payment_status || "N/A"}\n\n` +
        `${
          order.payment_status === "Đã thanh toán"
            ? "⚠️ Đơn hàng đã thanh toán sẽ được đánh dấu hoàn tiền."
            : ""
        }`
    );

    if (!confirmCancel) return;

    // If payment was made (paid status), refund it
    const needsRefund = order.payment_status === "Đã thanh toán";
    await updateOrderStatusLocal(order.order_id, "Hủy", needsRefund);
  };

  // Handle complete order
  const handleCompleteOrder = async (order) => {
    const confirmComplete = window.confirm(
      `Xác nhận hoàn thành đơn hàng #${order.order_id}?\n\n` +
        `Khách hàng: ${order.customer?.customer_name || "N/A"}\n` +
        `Tổng tiền: ${formatVND(order.total_amount)}`
    );

    if (!confirmComplete) return;

    await updateOrderStatusLocal(order.order_id, "Hoàn thành");
  };

  // Get status badge class
  const getStatusClass = (status) => {
    const statusMap = {
      pending: "warning",
      completed: "success",
      cancelled: "danger",
    };
    return statusMap[status] || "secondary";
  };

  const getPaymentStatusClass = (status) => {
    const statusMap = {
      paid: "success",
      unpaid: "warning",
      pending: "info",
      "Hoàn tiền": "danger",
    };
    return statusMap[status] || "secondary";
  };

  const getStatusText = (status) => {
    const textMap = {
      pending: "Chờ xử lý",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
    };
    return textMap[status] || status;
  };

  const getPaymentStatusText = (status) => {
    const textMap = {
      "Đã thanh toán": "Đã thanh toán",
      "Chưa thanh toán": "Chưa thanh toán",
      "Chờ xử lý": "Đang xử lý",
      "Hoàn tiền": "Hoàn tiền",
    };
    return textMap[status] || status;
  };

  if (loading) {
    return (
      <div className={cx("container")}>
        <div className={cx("loading")}>
          <div className={cx("spinner")}></div>
          <p>Đang tải danh sách đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cx("container")}>
      <Toaster position="top-right" />

      {/* Header */}
      <div className={cx("header")}>
        <h1 className={cx("title")}>Quản lý đơn hàng </h1>
        <div className={cx("stats")}>
          <div className={cx("stat-item")}>
            <span className={cx("stat-label")}>Tổng đơn:</span>
            <span className={cx("stat-value")}>{orders.length}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={cx("filters")}>
        <button
          className={cx("filter-btn", { active: filter === "all" })}
          onClick={() => setFilter("all")}
        >
          Tất cả
        </button>
        <button
          className={cx("filter-btn", { active: filter === "Chờ xử lý" })}
          onClick={() => setFilter("Chờ xử lý")}
        >
          Chờ xử lý
        </button>
        <button
          className={cx("filter-btn", { active: filter === "Hoàn thành" })}
          onClick={() => setFilter("Hoàn thành")}
        >
          Hoàn thành
        </button>
        <button
          className={cx("filter-btn", { active: filter === "Hủy" })}
          onClick={() => setFilter("Hủy")}
        >
          Đã hủy
        </button>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className={cx("empty")}>
          <p>Không có đơn hàng nào</p>
        </div>
      ) : (
        <div className={cx("orders-list")}>
          {orders.map((order) => (
            <div
              key={order.order_id}
              className={cx("order-card", {
                expanded: expandedOrder === order.order_id,
              })}
            >
              {/* Order Header */}
              <div
                className={cx("order-header")}
                onClick={() => toggleOrderExpansion(order.order_id)}
              >
                <div className={cx("order-main-info")}>
                  <div className={cx("order-id-section")}>
                    <h3 className={cx("order-id")}>#{order.order_id}</h3>
                    <span className={cx("order-date")}>
                      {formatDate(order.order_date)}
                    </span>
                  </div>
                  <div className={cx("order-customer")}>
                    <strong>
                      {order.customer?.customer_name || "Khách hàng"}
                    </strong>
                    <span>{order.customer?.phone || ""}</span>
                  </div>
                </div>

                <div className={cx("order-meta")}>
                  <div className={cx("payment-method-badge")}>
                    {order.payment?.[0]?.method?.toLowerCase() === "momo" ? (
                      <span className={cx("badge", "momo")}>💳 MoMo</span>
                    ) : order.payment?.[0]?.method?.toLowerCase() === "cod" ? (
                      <span className={cx("badge", "cod")}>💵 COD</span>
                    ) : (
                      <span className={cx("badge", "unknown")}>
                        {order.payment?.[0]?.method || "N/A"}
                      </span>
                    )}
                  </div>
                  <div className={cx("badges")}>
                    <span
                      className={cx(
                        "badge",
                        "status-badge",
                        getStatusClass(order.order_status)
                      )}
                    >
                      {getStatusText(order.order_status)}
                    </span>
                    <span
                      className={cx(
                        "badge",
                        "payment-badge",
                        getPaymentStatusClass(order.payment_status)
                      )}
                    >
                      {getPaymentStatusText(order.payment_status)}
                    </span>
                  </div>
                  <div className={cx("order-total")}>
                    {formatVND(order.total_amount)}
                  </div>
                </div>

                <div className={cx("expand-icon")}>
                  {expandedOrder === order.order_id ? "▼" : "▶"}
                </div>
              </div>

              {/* Order Details (Expanded) */}
              {expandedOrder === order.order_id && (
                <div className={cx("order-details")}>
                  {/* Delivery Address */}
                  <div className={cx("detail-section")}>
                    <h4>Địa chỉ giao hàng</h4>
                    <p>{order.delivery_address || "Chưa có địa chỉ"}</p>
                  </div>

                  {/* Transaction ID */}
                  {order.payment?.[0]?.transaction_id && (
                    <div className={cx("detail-section")}>
                      <h4>Mã giao dịch</h4>
                      <p className={cx("transaction-id")}>
                        {order.payment[0].transaction_id}
                      </p>
                    </div>
                  )}

                  {/* Order Note */}
                  {order.note && (
                    <div className={cx("detail-section")}>
                      <h4>Ghi chú</h4>
                      <p>{order.note}</p>
                    </div>
                  )}

                  {/* Order Items */}
                  {order.items && order.items.length > 0 && (
                    <div className={cx("detail-section")}>
                      <h4>Chi tiết sản phẩm</h4>
                      <div className={cx("items-list")}>
                        {order.items.map((item) => (
                          <div
                            key={item.order_detail_id}
                            className={cx("item")}
                          >
                            <img
                              src={
                                item.product?.image ||
                                "https://placehold.co/60x60?text=No+Image"
                              }
                              alt={item.product?.product_name}
                              className={cx("item-image")}
                            />
                            <div className={cx("item-info")}>
                              <div className={cx("item-name")}>
                                {item.product?.product_name || "Sản phẩm"}
                              </div>
                              <div className={cx("item-quantity")}>
                                SL: {item.quantity}
                              </div>
                            </div>
                            <div className={cx("item-price")}>
                              {formatVND(item.price * item.quantity)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Note */}
                  {order.note && (
                    <div className={cx("detail-section")}>
                      <h4>Ghi chú</h4>
                      <p className={cx("note")}>{order.note}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className={cx("order-actions")}>
                    {order.order_status === "Chờ xử lý" && (
                      <>
                        <button
                          className={cx("btn", "btn-success")}
                          onClick={() => handleCompleteOrder(order)}
                          disabled={processingAction === order.order_id}
                        >
                          {processingAction === order.order_id
                            ? "Đang xử lý..."
                            : "Hoàn thành"}
                        </button>
                        <button
                          className={cx("btn", "btn-danger")}
                          onClick={() => handleCancelOrder(order)}
                          disabled={processingAction === order.order_id}
                        >
                          Hủy đơn
                        </button>
                      </>
                    )}

                    {(order.order_status === "Hoàn thành" ||
                      order.order_status === "Hủy") && (
                      <div className={cx("status-message")}>
                        {order.order_status === "Hoàn thành"
                          ? "✅ Đơn hàng đã hoàn thành"
                          : "❌ Đơn hàng đã bị hủy"}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrderList;
