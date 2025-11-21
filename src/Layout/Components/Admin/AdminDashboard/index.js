// src/Pages/Admin/AdminDashboard/index.js
import { useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from "./AdminDashboard.module.scss";
import {
  getAllProducts,
  getAllCategories,
  getCustomers,
  getAllOrders,
  getOrderItems,
} from "~/Api";
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

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview"); // overview, products, categories, customers, orders
  const [loading, setLoading] = useState(false);

  // Data states
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [paymentFilter, setPaymentFilter] = useState("all"); // Payment method filter
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalCustomers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    PendingOrders: 0,
    CompleteddOrders: 0,
    momoOrders: 0, // Add MoMo stats
    codOrders: 0, // Add COD stats
  });

  // Expanded order state
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Load all data
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadProducts(),
        loadCategories(),
        loadCustomers(),
        loadOrders(),
      ]);
    } catch (error) {
      console.error("Load data error:", error);
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await getAllProducts();
      setProducts(data || []);
    } catch (err) {
      console.error("Load products error:", err);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await getAllCategories();
      setCategories(data || []);
    } catch (err) {
      console.error("Load categories error:", err);
    }
  };

  const loadCustomers = async () => {
    try {
      const data = await getCustomers();
      setCustomers(data || []);
    } catch (err) {
      console.error("Load customers error:", err);
    }
  };

  const loadOrders = async () => {
    try {
      const data = await getAllOrders();
      setOrders(data || []);

      // Calculate stats
      calculateStats(data || []);
    } catch (err) {
      console.error("Load orders error:", err);
    }
  };

  const calculateStats = (ordersData) => {
    const totalOrders = ordersData.length;
    const PendingOrders = ordersData.filter(
      (o) => o.order_status === "Pending"
    ).length;
    const CompleteddOrders = ordersData.filter(
      (o) => o.order_status === "Completedd"
    ).length;
    const momoOrders = ordersData.filter(
      (o) => o.payment?.[0]?.method?.toLowerCase() === "momo"
    ).length;

    const totalRevenue = ordersData
      .filter((o) => o.order_status === "Completedd")
      .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

    setStats({
      totalProducts: products.length,
      totalCategories: categories.length,
      totalCustomers: customers.length,
      totalOrders,
      totalRevenue,
      PendingOrders,
      CompleteddOrders,
      momoOrders,
    });
  };

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

  // Recalculate stats when data changes
  useEffect(() => {
    if (orders.length > 0) {
      calculateStats(orders);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, products, categories, customers]);

  const getStatusBadge = (status) => {
    const capitalizeStatus = (str) =>
      str.charAt(0).toUpperCase() + str.slice(1);
    const badges = {
      Pending: { text: capitalizeStatus("Pending"), class: "warning" },
      Completedd: { text: capitalizeStatus("Completedd"), class: "success" },
      Cancelled: { text: capitalizeStatus("Cancelled"), class: "danger" },
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

  if (loading && activeTab === "overview") {
    return (
      <div className={cx("container")}>
        <div className={cx("loading")}>
          <div className={cx("spinner")}></div>
          <p>Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cx("container")}>
      <Toaster position="top-right" />

      {/* Header */}
      <div className={cx("header")}>
        <h1 className={cx("title")}> Admin Dashboard</h1>
        <button className={cx("refresh-btn")} onClick={loadData}>
          Refresh
        </button>
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
          className={cx("tab", { active: activeTab === "products" })}
          onClick={() => setActiveTab("products")}
        >
          Products ({products.length})
        </button>
        <button
          className={cx("tab", { active: activeTab === "categories" })}
          onClick={() => setActiveTab("categories")}
        >
          Categories ({categories.length})
        </button>
        <button
          className={cx("tab", { active: activeTab === "customers" })}
          onClick={() => setActiveTab("customers")}
        >
          Customers ({customers.length})
        </button>
        <button
          className={cx("tab", { active: activeTab === "orders" })}
          onClick={() => setActiveTab("orders")}
        >
          Orders ({orders.length})
        </button>
      </div>

      {/* Content Area */}
      <div className={cx("content")}>
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className={cx("overview")}>
            <div className={cx("stats-grid")}>
              <div className={cx("stat-card", "blue")}>
                <div className={cx("stat-info")}>
                  <h3>Products</h3>
                  <p className={cx("stat-number")}>{stats.totalProducts}</p>
                </div>
              </div>

              <div className={cx("stat-card", "green")}>
                <div className={cx("stat-info")}>
                  <h3>Categories</h3>
                  <p className={cx("stat-number")}>{stats.totalCategories}</p>
                </div>
              </div>

              <div className={cx("stat-card", "purple")}>
                <div className={cx("stat-info")}>
                  <h3>Customers</h3>
                  <p className={cx("stat-number")}>{stats.totalCustomers}</p>
                </div>
              </div>

              <div className={cx("stat-card", "orange")}>
                <div className={cx("stat-info")}>
                  <h3>Orders</h3>
                  <p className={cx("stat-number")}>{stats.totalOrders}</p>
                </div>
              </div>

              <div className={cx("stat-card", "yellow")}>
                <div className={cx("stat-info")}>
                  <h3>Pending</h3>
                  <p className={cx("stat-number")}>{stats.PendingOrders}</p>
                </div>
              </div>

              <div className={cx("stat-card", "teal")}>
                <div className={cx("stat-info")}>
                  <h3>Completedd</h3>
                  <p className={cx("stat-number")}>{stats.CompleteddOrders}</p>
                </div>
              </div>

              <div className={cx("stat-card", "red", "wide")}>
                <div className={cx("stat-icon")}>💰</div>
                <div className={cx("stat-info")}>
                  <h3>Total Revenue</h3>
                  <p className={cx("stat-number")}>
                    {formatVND(stats.totalRevenue)}
                  </p>
                </div>
              </div>

              <div className={cx("stat-card", "pink")}>
                <div className={cx("stat-icon")}>💳</div>
                <div className={cx("stat-info")}>
                  <h3>MoMo</h3>
                  <p className={cx("stat-number")}>{stats.momoOrders}</p>
                </div>
              </div>

              <div className={cx("stat-card", "indigo")}>
                <div className={cx("stat-icon")}>💵</div>
                <div className={cx("stat-info")}>
                  <h3>COD</h3>
                  <p className={cx("stat-number")}>{stats.codOrders}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === "products" && (
          <div className={cx("table-container")}>
            <h2 className={cx("section-title")}>Product List</h2>
            <div className={cx("table-wrapper")}>
              <table className={cx("data-table")}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Image</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Rating</th>
                    <th>Status</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.product_id}>
                      <td>{product.product_id}</td>
                      <td>
                        <img
                          src={product.image}
                          alt={product.product_name}
                          className={cx("product-image")}
                        />
                      </td>
                      <td className={cx("product-name")}>
                        {product.product_name}
                      </td>
                      <td>{product.category?.name || "Chưa có"}</td>
                      <td className={cx("price")}>
                        {formatVND(product.price)}
                      </td>
                      <td>
                        <span className={cx("rating")}>
                          ⭐ {product.rating || "Chưa có"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={cx(
                            "status-badge",
                            product.status ? "active" : "inactive"
                          )}
                        >
                          {product.status ? "✓ Hoạt động" : "✗ Không hoạt động"}
                        </span>
                      </td>
                      <td className={cx("description")}>
                        {product.description || "No description"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === "categories" && (
          <div className={cx("table-container")}>
            <h2 className={cx("section-title")}>Category List</h2>
            <div className={cx("table-wrapper")}>
              <table className={cx("data-table")}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Icon</th>
                    <th>Category Name</th>
                    <th>Number of Products</th>
                    <th>Status</th>
                    <th>Created Date</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => {
                    const productCount = products.filter(
                      (p) => p.category_id === category.category_id
                    ).length;

                    return (
                      <tr key={category.category_id}>
                        <td>{category.category_id}</td>
                        <td>
                          <div className={cx("category-icon-cell")}>📁</div>
                        </td>
                        <td className={cx("category-name")}>{category.name}</td>
                        <td>
                          <span className={cx("product-count-badge")}>
                            {productCount} products
                          </span>
                        </td>
                        <td>
                          <span
                            className={cx(
                              "status-badge",
                              category.status ? "active" : "inactive"
                            )}
                          >
                            {category.status ? "✓ Active" : "✗ Inactive"}
                          </span>
                        </td>
                        <td>{formatDate(category.created_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === "customers" && (
          <div className={cx("table-container")}>
            <h2 className={cx("section-title")}>Customer List</h2>
            <div className={cx("table-wrapper")}>
              <table className={cx("data-table")}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer Name</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Created Date</th>
                    <th>Số đơn hàng</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => {
                    const customerOrders = orders.filter(
                      (o) => o.customer_id === customer.customer_id
                    );
                    return (
                      <tr key={customer.customer_id}>
                        <td className={cx("customer-id")}>
                          {customer.customer_id.substring(0, 8)}...
                        </td>
                        <td className={cx("customer-name")}>
                          {customer.customer_name}
                        </td>
                        <td>{customer.phone || "Chưa có"}</td>
                        <td className={cx("address")}>
                          {customer.address || "Chưa có"}
                        </td>
                        <td>{formatDate(customer.created_at)}</td>
                        <td>
                          <span className={cx("order-count")}>
                            {customerOrders.length} đơn
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className={cx("orders-section")}>
            <div className={cx("section-header")}>
              <h2 className={cx("section-title")}>Order List</h2>
              <div className={cx("payment-filters")}>
                <button
                  className={cx("filter-btn", {
                    active: paymentFilter === "all",
                  })}
                  onClick={() => setPaymentFilter("all")}
                >
                  Tất cả ({orders.length})
                </button>
                <button
                  className={cx("filter-btn", {
                    active: paymentFilter === "momo",
                  })}
                  onClick={() => setPaymentFilter("momo")}
                >
                  💳 MoMo ({stats.momoOrders})
                </button>
                <button
                  className={cx("filter-btn", {
                    active: paymentFilter === "cod",
                  })}
                  onClick={() => setPaymentFilter("cod")}
                >
                  💵 COD ({stats.codOrders})
                </button>
              </div>
            </div>
            <div className={cx("orders-list")}>
              {orders
                .filter(
                  (order) =>
                    paymentFilter === "all" ||
                    order.payment?.[0]?.method?.toLowerCase() === paymentFilter
                )
                .map((order) => (
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
                            <span className={cx("badge", "momo")}>💳 MoMo</span>
                          ) : order.payment?.[0]?.method?.toLowerCase() ===
                            "cod" ? (
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
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
