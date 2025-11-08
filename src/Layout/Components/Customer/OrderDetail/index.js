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
    Pending: "Pending",
    Completed: "Completed",
    Cancelled: "Cancelled",
  };
  return statusMap[status] || status;
};

const getStatusColor = (status) => {
  const colorMap = {
    Pending: "warning",
    Completed: "success",
    Cancelled: "danger",
  };
  return colorMap[status] || "default";
};

// Status timeline steps
const getStatusTimeline = (currentStatus) => {
  const allSteps = [
    { key: "Pending", label: "Pending" },
    { key: "Completed", label: "Completed" },
  ];

  if (
    currentStatus === "Cancelled" ||
    currentStatus === "Đã hủy" ||
    currentStatus === "Hủy"
  ) {
    return [
      { key: "Pending", label: "Ordered", active: true },
      {
        key: "Cancelled",
        label: "Cancelled",
        active: true,
        isCancelled: true,
      },
    ];
  }

  const currentIndex = allSteps.findIndex((step) => step.key === currentStatus);

  return allSteps.map((step, index) => ({
    ...step,
    active: index <= currentIndex,
    current: index === currentIndex,
  }));
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
          toast.error("You do not have permission to view this order", {
            duration: 3000,
          });
          navigate("/profile/order");
          return;
        }

        setOrder(data);
      } catch (err) {
        if (!active) return;
        console.error("Load order detail error:", err);
        setError(err.message || "Cannot load order details");
        toast.error("Cannot load order details", { duration: 3000 });
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
    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    try {
      setCancelling(true);
      await cancelOrder({ orderId: order.order_id });
      toast.success("Order cancelled successfully", { duration: 3000 });

      // Update local state with cancelled status and refund payment status
      setOrder((prev) => ({
        ...prev,
        order_status: "Cancelled",
        payment_status: "Refunded",
      }));
    } catch (err) {
      console.error("Cancel order error:", err);
      toast.error(err.message || "Cannot cancel order", { duration: 3000 });
    } finally {
      setCancelling(false);
    }
  };

  // Check if order can be cancelled (pending, processing, or shipping status)
  const canCancelOrder =
    order && ["Pending", "Processing"].includes(order.order_status);

  if (loading) {
    return (
      <div className={cx("container")}>
        <div className={cx("loading")}>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className={cx("container")}>
        <div className={cx("error-container")}>
          <p className={cx("error")}>{error || "Order not found"}</p>
          <button className={cx("btn-back")} onClick={handleBack}>
            Back to order list
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
  const statusTimeline = getStatusTimeline(order.order_status);

  return (
    <div className={cx("container")}>
      <div className={cx("header")}>
        <h1 className={cx("title")}>Order Detail #{order.order_id}</h1>
      </div>

      <div className={cx("content")}>
        {/* Enhanced Order Status Card with Timeline */}
        <div className={cx("card", "status-card")}>
          <div className={cx("card-header")}>
            <div className={cx("status-header-content")}>
              <h3>Order Status</h3>
              <span
                className={cx(
                  "status-badge",
                  "large",
                  getStatusColor(order.order_status)
                )}
              >
                <span>{getStatusText(order.order_status)}</span>
              </span>
            </div>
          </div>
          <div className={cx("card-body")}>
            {/* Status Timeline */}
            <div className={cx("status-timeline")}>
              {statusTimeline.map((step, index) => (
                <div
                  key={step.key}
                  className={cx("timeline-step", {
                    active: step.active,
                    current: step.current,
                    cancelled: step.isCancelled,
                  })}
                >
                  <div className={cx("timeline-marker")}>
                    <span className={cx("timeline-icon")}></span>
                  </div>
                  <div className={cx("timeline-label")}>{step.label}</div>
                  {index < statusTimeline.length - 1 && (
                    <div className={cx("timeline-connector")} />
                  )}
                </div>
              ))}
            </div>

            {/* Order Information */}
            <div className={cx("order-info-grid")}>
              <div className={cx("info-row")}>
                <span className={cx("label")}>Order Date:</span>
                <span className={cx("value", "highlight")}>
                  {formatDate(order.order_date)}
                </span>
              </div>
              <div className={cx("info-row")}>
                <span className={cx("label")}>Payment Status:</span>
                <span
                  className={cx(
                    "value",
                    "payment-status",
                    order.payment_status === "Paid"
                      ? "paid"
                      : order.payment_status === "Refunded"
                      ? "refunded"
                      : "unpaid"
                  )}
                >
                  {order.payment_status === "Paid"
                    ? "Paid"
                    : order.payment_status === "Refunded"
                    ? "Refunded"
                    : "Unpaid"}
                </span>
              </div>
              <div className={cx("info-row")}>
                <span className={cx("label")}>Payment Method:</span>
                <span className={cx("value")}>
                  {order.payment?.[0]?.method?.toLowerCase() === "momo"
                    ? "MoMo E-Wallet"
                    : order.payment?.[0]?.method?.toLowerCase() === "cod"
                    ? "Cash on Delivery (COD)"
                    : order.payment?.[0]?.method || "Unknown"}
                </span>
              </div>
              {order.payment?.[0]?.transaction_id && (
                <div className={cx("info-row")}>
                  <span className={cx("label")}>Transaction ID:</span>
                  <span className={cx("value", "transaction-id")}>
                    {order.payment[0].transaction_id}
                  </span>
                </div>
              )}
            </div>

            {/* Cancel Button */}
            {canCancelOrder && (
              <div className={cx("cancel-section")}>
                <p className={cx("cancel-note")}>
                  You can cancel this order before it is shipped
                </p>
                <button
                  className={cx("btn-cancel")}
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                >
                  {cancelling ? "Cancelling..." : "Cancel Order"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Delivery Info Card */}
        <div className={cx("card")}>
          <div className={cx("card-header")}>
            <h3>Delivery Information</h3>
          </div>
          <div className={cx("card-body")}>
            <div className={cx("info-row")}>
              <span className={cx("label")}>Address:</span>
              <span className={cx("value")}>
                {order.delivery_address || "Not updated"}
              </span>
            </div>
            {order.note && (
              <div className={cx("info-row")}>
                <span className={cx("label")}>Note:</span>
                <span className={cx("value")}>{order.note}</span>
              </div>
            )}
          </div>
        </div>

        {/* Order Items Card */}
        <div className={cx("card", "items-card")}>
          <div className={cx("card-header")}>
            <h3>Products ({order.items.length})</h3>
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
            <h3>Order Summary</h3>
          </div>
          <div className={cx("card-body")}>
            <div className={cx("summary-row")}>
              <span className={cx("label")}>Subtotal:</span>
              <span className={cx("value")}>{formatVND(itemsSubtotal)}</span>
            </div>
            <div className={cx("summary-row")}>
              <span className={cx("label")}>Shipping Fee:</span>
              <span className={cx("value")}>{formatVND(shippingFee)}</span>
            </div>
            <div className={cx("summary-row", "total")}>
              <span className={cx("label")}>Total:</span>
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
