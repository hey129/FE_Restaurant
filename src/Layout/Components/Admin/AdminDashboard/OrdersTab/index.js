import { useState, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "../AdminDashboard.module.scss";
import { getOrderItems, getAllOrdersAdmin, getMerchants } from "~/Api";

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

function OrdersTab() {
  // Local state management
  const [orders, setOrders] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    momoOrders: 0,
    codOrders: 0,
  });

  // Load orders and merchants on mount
  useEffect(() => {
    const loadAllData = async () => {
      try {
        await Promise.all([loadOrders(), loadMerchants()]);
      } catch (err) {
        console.error("Load data error:", err);
      }
    };
    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadOrders = async () => {
    try {
      const data = await getAllOrdersAdmin();
      setOrders(data || []);
      calculateStats(data || []);
    } catch (err) {
      console.error("Load orders error:", err);
    }
  };

  const loadMerchants = async () => {
    try {
      const data = await getMerchants();
      setMerchants(data || []);
    } catch (err) {
      console.error("Load merchants error:", err);
    }
  };

  const calculateStats = (orderData) => {
    let momoCount = 0;
    let codCount = 0;

    orderData.forEach((order) => {
      if (order.payment?.[0]?.method?.toLowerCase() === "momo") momoCount++;
      if (order.payment?.[0]?.method?.toLowerCase() === "cod") codCount++;
    });

    setStats({
      momoOrders: momoCount,
      codOrders: codCount,
    });
  };

  const getStatusBadge = (status) => {
    const capitalizeStatus = (str) =>
      str.charAt(0).toUpperCase() + str.slice(1);
    const badges = {
      pending: { text: capitalizeStatus("pending"), class: "warning" },
      completed: { text: capitalizeStatus("completed"), class: "success" },
      cancelled: { text: capitalizeStatus("cancelled"), class: "danger" },
    };
    return (
      badges[status] || { text: capitalizeStatus(status), class: "default" }
    );
  };

  const getPaymentBadge = (status) => {
    const badges = {
      Paid: { text: "Paid", class: "success" },
      Refunded: { text: "Refunded", class: "danger" },
    };
    return badges[status] || { text: status, class: "default" };
  };

  const loadOrderItems = async (orderId) => {
    try {
      const data = await getOrderItems({ orderId });
      return data || [];
    } catch (err) {
      console.error("Load order items error:", err);
      return [];
    }
  };

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

  return (
    <div className={cx("orders-section")}>
      <div className={cx("section-header")}>
        <h2 className={cx("section-title")}>Order List by Merchant</h2>
        <input
          type="text"
          placeholder="Search orders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: "4px",
            border: "1px solid #ddd",
            minWidth: "200px",
          }}
        />
      </div>
      <div className={cx("section-header")}>
        <div className={cx("payment-filters")}>
          <button
            className={cx("filter-btn", {
              active: paymentFilter === "all",
            })}
            onClick={() => setPaymentFilter("all")}
          >
            All ({orders.length})
          </button>
          <button
            className={cx("filter-btn", {
              active: paymentFilter === "momo",
            })}
            onClick={() => setPaymentFilter("momo")}
          >
            MoMo ({stats.momoOrders})
          </button>
          <button
            className={cx("filter-btn", {
              active: paymentFilter === "cod",
            })}
            onClick={() => setPaymentFilter("cod")}
          >
            COD ({stats.codOrders})
          </button>
        </div>
      </div>

      {merchants.map((merchant) => {
        const merchantOrders = orders
          .filter((o) => o.merchant_id === merchant.merchant_id)
          .filter(
            (order) =>
              (paymentFilter === "all" ||
                order.payment?.[0]?.method?.toLowerCase() === paymentFilter) &&
              (searchTerm === "" ||
                merchant.merchant_name
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase()) ||
                order.order_id.toString().includes(searchTerm) ||
                order.customer?.customer_name
                  ?.toLowerCase()
                  .includes(searchTerm.toLowerCase()) ||
                order.customer?.phone
                  ?.toLowerCase()
                  .includes(searchTerm.toLowerCase()) ||
                order.delivery_address
                  ?.toLowerCase()
                  .includes(searchTerm.toLowerCase()))
          );

        if (merchantOrders.length === 0) return null;

        return (
          <div key={merchant.merchant_id} className={cx("merchant-section")}>
            <h3 className={cx("merchant-title")}>{merchant.merchant_name}</h3>
            <div className={cx("orders-list")}>
              {merchantOrders.map((order) => (
                <div key={order.order_id} className={cx("order-card")}>
                  <div
                    className={cx("order-header")}
                    onClick={() => toggleOrderExpansion(order.order_id)}
                  >
                    <div className={cx("order-info")}>
                      <div className={cx("order-id")}>
                        Order #{order.order_id}
                      </div>
                      <div className={cx("order-date")}>
                        {formatDate(order.order_date)}
                      </div>
                      <div className={cx("order-customer")}>
                        <strong>
                          {order.customer?.customer_name || "Customer"}
                        </strong>
                        <span>{order.customer?.phone || ""}</span>
                      </div>
                    </div>

                    <div className={cx("order-meta")}>
                      <div className={cx("payment-method-badge")}>
                        {order.payment?.[0]?.method?.toLowerCase() ===
                        "momo" ? (
                          <span className={cx("badge", "momo")}>MoMo</span>
                        ) : order.payment?.[0]?.method?.toLowerCase() ===
                          "cod" ? (
                          <span className={cx("badge", "cod")}>COD</span>
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
                            getStatusBadge(order.order_status).class
                          )}
                        >
                          {getStatusBadge(order.order_status).text}
                        </span>
                        <span
                          className={cx(
                            "badge",
                            getPaymentBadge(order.payment_status).class
                          )}
                        >
                          {getPaymentBadge(order.payment_status).text}
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

                  {expandedOrder === order.order_id && (
                    <div className={cx("order-details")}>
                      <div className={cx("detail-section")}>
                        <h4>Delivery Address</h4>
                        <p>{order.delivery_address || "No address"}</p>
                      </div>

                      {order.payment?.[0]?.transaction_id && (
                        <div className={cx("detail-section")}>
                          <h4>Transaction ID</h4>
                          <p className={cx("transaction-id")}>
                            {order.payment[0].transaction_id}
                          </p>
                        </div>
                      )}

                      {order.note && (
                        <div className={cx("detail-section")}>
                          <h4>Note</h4>
                          <p>{order.note}</p>
                        </div>
                      )}

                      {order.items && order.items.length > 0 && (
                        <div className={cx("detail-section")}>
                          <h4>Product Details</h4>
                          <div className={cx("items-list")}>
                            {order.items.map((item) => (
                              <div
                                key={item.order_detail_id}
                                className={cx("item")}
                              >
                                <img
                                  src={item.product?.image}
                                  alt={item.product?.product_name}
                                  className={cx("item-image")}
                                />
                                <div className={cx("item-info")}>
                                  <p className={cx("item-name")}>
                                    {item.product?.product_name}
                                  </p>
                                  <p className={cx("item-quantity")}>
                                    Quantity: {item.quantity}
                                  </p>
                                </div>
                                <div className={cx("item-price")}>
                                  {formatVND(item.price * item.quantity)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default OrdersTab;
