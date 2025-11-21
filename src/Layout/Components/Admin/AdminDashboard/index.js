// src/Pages/Admin/AdminDashboard/index.js
import { useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from "./AdminDashboard.module.scss";
import {
  getOrderItems,
  getCustomers,
  createMerchantProduct,
  updateMerchantProduct,
  deleteMerchantProduct,
  createMerchantCategory,
  updateMerchantCategory,
  deleteMerchantCategory,
} from "~/Api";
import { getAdminAllProducts } from "~/Api/Product";
import { getAdminAllCategories } from "~/Api/Category";
import { getAdminAllOrders } from "~/Api/Order";
import { getMerchants } from "~/Api/Merchant";
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
  const [activeTab, setActiveTab] = useState("overview"); // overview, products, categories, customers, orders, merchants
  const [loading, setLoading] = useState(false);

  // Data states
  const [merchants, setMerchants] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [paymentFilter, setPaymentFilter] = useState("all"); // Payment method filter
  const [searchTerm, setSearchTerm] = useState(""); // Global search

  // Modal states for merchant management
  const [showMerchantModal, setShowMerchantModal] = useState(false);
  const [editingMerchant, setEditingMerchant] = useState(null);
  const [merchantForm, setMerchantForm] = useState({
    merchant_name: "",
    address: "",
    phone: "",
    email: "",
    status: true,
  });

  // Modal states for product management
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    product_name: "",
    price: "",
    category_id: "",
    description: "",
    image: "",
  });
  const [productModalMerchant, setProductModalMerchant] = useState(null);

  // Modal states for category management
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
  });
  const [categoryModalMerchant, setCategoryModalMerchant] = useState(null);

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalCustomers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    PendingOrders: 0,
    CompletedOrders: 0,
    momoOrders: 0,
    totalMerchants: 0,
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
        loadMerchants(),
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

  const loadMerchants = async () => {
    try {
      const data = await getMerchants();
      setMerchants(data || []);
    } catch (err) {
      console.error("Load merchants error:", err);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await getAdminAllProducts();
      setProducts(data || []);
    } catch (err) {
      console.error("Load products error:", err);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await getAdminAllCategories();
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
      const data = await getAdminAllOrders();
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
      (o) => o.order_status === "pending"
    ).length;
    const CompletedOrders = ordersData.filter(
      (o) => o.order_status === "completed"
    ).length;
    const momoOrders = ordersData.filter(
      (o) => o.payment?.[0]?.method?.toLowerCase() === "momo"
    ).length;

    const totalRevenue = ordersData
      .filter((o) => o.order_status === "completed")
      .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

    setStats({
      totalProducts: products.length,
      totalCategories: categories.length,
      totalCustomers: customers.length,
      totalOrders,
      totalRevenue,
      PendingOrders,
      CompletedOrders,
      momoOrders,
      totalMerchants: merchants.length,
    });
  };

  // Merchant management functions
  const openMerchantModal = (merchant = null) => {
    if (merchant) {
      setEditingMerchant(merchant);
      setMerchantForm({
        merchant_name: merchant.merchant_name,
        address: merchant.address || "",
        phone: merchant.phone || "",
        email: merchant.email || "",
        status: merchant.status,
      });
    } else {
      setEditingMerchant(null);
      setMerchantForm({
        merchant_name: "",
        address: "",
        phone: "",
        email: "",
        status: true,
      });
    }
    setShowMerchantModal(true);
  };

  const closeMerchantModal = () => {
    setShowMerchantModal(false);
    setEditingMerchant(null);
  };

  const handleMerchantFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMerchantForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const saveMerchant = async () => {
    if (!merchantForm.merchant_name.trim()) {
      toast.error("Vui lòng nhập tên quán");
      return;
    }

    try {
      // TODO: Implement API call for creating/updating merchant
      // This would require backend API endpoints for:
      // - createMerchant()
      // - updateMerchant()

      if (editingMerchant) {
        toast.success("Cập nhật quán thành công");
        // await updateMerchant(editingMerchant.merchant_id, merchantForm);
      } else {
        toast.success("Tạo quán thành công");
        // await createMerchant(merchantForm);
      }

      closeMerchantModal();
      loadMerchants();
    } catch (err) {
      console.error("Save merchant error:", err);
      toast.error("Lỗi khi lưu quán");
    }
  };

  const deleteMerchant = async (merchantId) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa quán này?")) return;

    try {
      // TODO: Implement API call for deleting merchant
      // await deleteMerchantFn(merchantId);
      toast.success("Xóa quán thành công");
      loadMerchants();
    } catch (err) {
      console.error("Delete merchant error:", err);
      toast.error("Lỗi khi xóa quán");
    }
  };

  // Product Modal Functions
  const openProductModal = (merchant, product = null) => {
    setProductModalMerchant(merchant);
    if (product) {
      setEditingProduct(product);
      setProductForm({
        product_name: product.product_name,
        price: product.price,
        category_id: product.category_id,
        description: product.description,
        image: product.image,
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        product_name: "",
        price: "",
        category_id: "",
        description: "",
        image: "",
      });
    }
    setShowProductModal(true);
  };

  const closeProductModal = () => {
    setShowProductModal(false);
    setEditingProduct(null);
    setProductModalMerchant(null);
  };

  const handleProductFormChange = (e) => {
    const { name, value } = e.target;
    setProductForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const saveProduct = async () => {
    if (!productForm.product_name.trim()) {
      toast.error("Vui lòng nhập tên sản phẩm");
      return;
    }
    if (!productForm.category_id) {
      toast.error("Vui lòng chọn danh mục");
      return;
    }

    try {
      if (editingProduct) {
        await updateMerchantProduct({
          productId: editingProduct.product_id,
          productName: productForm.product_name,
          price: productForm.price,
          categoryId: productForm.category_id,
          description: productForm.description,
          image: productForm.image,
        });
        toast.success("Cập nhật sản phẩm thành công");
      } else {
        await createMerchantProduct({
          merchantId: productModalMerchant.merchant_id,
          productName: productForm.product_name,
          price: productForm.price,
          categoryId: productForm.category_id,
          description: productForm.description,
          image: productForm.image,
        });
        toast.success("Tạo sản phẩm thành công");
      }
      closeProductModal();
      loadProducts();
    } catch (err) {
      console.error("Save product error:", err);
      toast.error("Lỗi khi lưu sản phẩm");
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa sản phẩm này?")) return;

    try {
      await deleteMerchantProduct({ productId });
      toast.success("Xóa sản phẩm thành công");
      loadProducts();
    } catch (err) {
      console.error("Delete product error:", err);
      toast.error("Lỗi khi xóa sản phẩm");
    }
  };

  // Category Modal Functions
  const openCategoryModal = (merchant, category = null) => {
    setCategoryModalMerchant(merchant);
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        name: "",
      });
    }
    setShowCategoryModal(true);
  };

  const closeCategoryModal = () => {
    setShowCategoryModal(false);
    setEditingCategory(null);
    setCategoryModalMerchant(null);
  };

  const handleCategoryFormChange = (e) => {
    const { name, value } = e.target;
    setCategoryForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const saveCategory = async () => {
    if (!categoryForm.name.trim()) {
      toast.error("Vui lòng nhập tên danh mục");
      return;
    }

    try {
      if (editingCategory) {
        await updateMerchantCategory({
          categoryId: editingCategory.category_id,
          name: categoryForm.name,
        });
        toast.success("Cập nhật danh mục thành công");
      } else {
        await createMerchantCategory({
          merchantId: categoryModalMerchant.merchant_id,
          name: categoryForm.name,
        });
        toast.success("Tạo danh mục thành công");
      }
      closeCategoryModal();
      loadCategories();
    } catch (err) {
      console.error("Save category error:", err);
      toast.error("Lỗi khi lưu danh mục");
    }
  };

  const deleteCategory = async (categoryId) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa danh mục này?")) return;

    try {
      await deleteMerchantCategory({ categoryId });
      toast.success("Xóa danh mục thành công");
      loadCategories();
    } catch (err) {
      console.error("Delete category error:", err);
      toast.error("Lỗi khi xóa danh mục");
    }
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
    if (orders.length > 0 || merchants.length > 0) {
      calculateStats(orders);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, products, categories, customers, merchants]);

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
          className={cx("tab", { active: activeTab === "merchants" })}
          onClick={() => setActiveTab("merchants")}
        >
          Merchants ({merchants.length})
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

      {/* Search Bar Below Tabs */}
      {activeTab !== "overview" && (
        <div className={cx("search-bar-container")}>
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={cx("search-input")}
          />
        </div>
      )}

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
                  <h3>Merchants</h3>
                  <p className={cx("stat-number")}>{stats.totalMerchants}</p>
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
                  <h3>Completed</h3>
                  <p className={cx("stat-number")}>{stats.CompletedOrders}</p>
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
            </div>
          </div>
        )}

        {/* Merchants Tab */}
        {activeTab === "merchants" && (
          <div className={cx("table-container")}>
            <div className={cx("section-header")}>
              <h2 className={cx("section-title")}>Merchant Management</h2>
              <button
                className={cx("btn", "btn-primary")}
                onClick={() => openMerchantModal()}
              >
                ➕ Add Merchant
              </button>
            </div>
            <div className={cx("table-wrapper")}>
              <table className={cx("data-table")}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Merchant Name</th>
                    <th>Address</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {merchants
                    .filter(
                      (merchant) =>
                        merchant.merchant_name
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        merchant.phone
                          ?.toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        merchant.email
                          ?.toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        merchant.address
                          ?.toLowerCase()
                          .includes(searchTerm.toLowerCase())
                    )
                    .map((merchant) => (
                      <tr key={merchant.merchant_id}>
                        <td>{merchant.merchant_id.substring(0, 8)}...</td>
                        <td className={cx("merchant-name")}>
                          {merchant.merchant_name}
                        </td>
                        <td className={cx("address")}>
                          {merchant.address || "N/A"}
                        </td>
                        <td>{merchant.phone || "N/A"}</td>
                        <td>{merchant.email || "N/A"}</td>
                        <td>
                          <span
                            className={cx(
                              "status-badge",
                              merchant.status ? "active" : "inactive"
                            )}
                          >
                            {merchant.status ? "✓ Active" : "✗ Inactive"}
                          </span>
                        </td>
                        <td>
                          <button
                            className={cx("btn", "btn-sm", "btn-edit")}
                            onClick={() => openMerchantModal(merchant)}
                          >
                            Edit
                          </button>
                          <button
                            className={cx("btn", "btn-sm", "btn-delete")}
                            onClick={() => deleteMerchant(merchant.merchant_id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === "products" && (
          <div className={cx("table-container")}>
            <div className={cx("section-header")}>
              <h2 className={cx("section-title")}>Product List by Merchant</h2>
            </div>
            {merchants.map((merchant) => {
              const merchantProducts = products
                .filter((p) => p.merchant_id === merchant.merchant_id)
                .filter(
                  (p) =>
                    p.product_name
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    p.category?.name
                      ?.toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    p.description
                      ?.toLowerCase()
                      .includes(searchTerm.toLowerCase())
                );
              if (merchantProducts.length === 0) return null;

              return (
                <div
                  key={merchant.merchant_id}
                  className={cx("merchant-section")}
                >
                  <div className={cx("merchant-header")}>
                    <h3 className={cx("merchant-title")}>
                      {merchant.merchant_name}
                    </h3>
                    <button
                      className={cx("btn", "btn-sm", "btn-primary")}
                      onClick={() => openProductModal(merchant)}
                    >
                      ➕ Add Product
                    </button>
                  </div>
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
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {merchantProducts.map((product) => (
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
                                {product.status
                                  ? "✓ Hoạt động"
                                  : "✗ Không hoạt động"}
                              </span>
                            </td>
                            <td className={cx("description")}>
                              {product.description || "No description"}
                            </td>
                            <td>
                              <button
                                className={cx("btn", "btn-sm", "btn-edit")}
                                onClick={() =>
                                  openProductModal(merchant, product)
                                }
                              >
                                Edit
                              </button>
                              <button
                                className={cx("btn", "btn-sm", "btn-delete")}
                                onClick={() =>
                                  deleteProduct(product.product_id)
                                }
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === "categories" && (
          <div className={cx("table-container")}>
            <div className={cx("section-header")}>
              <h2 className={cx("section-title")}>Category List by Merchant</h2>
            </div>
            {merchants.map((merchant) => {
              const merchantCategories = categories
                .filter((c) => c.merchant_id === merchant.merchant_id)
                .filter((c) =>
                  c.name.toLowerCase().includes(searchTerm.toLowerCase())
                );
              if (merchantCategories.length === 0) return null;

              return (
                <div
                  key={merchant.merchant_id}
                  className={cx("merchant-section")}
                >
                  <div className={cx("merchant-header")}>
                    <h3 className={cx("merchant-title")}>
                      {merchant.merchant_name}
                    </h3>
                    <button
                      className={cx("btn", "btn-sm", "btn-primary")}
                      onClick={() => openCategoryModal(merchant)}
                    >
                      ➕ Add Category
                    </button>
                  </div>
                  <div className={cx("table-wrapper")}>
                    <table className={cx("data-table")}>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Category Name</th>
                          <th>Number of Products</th>
                          <th>Status</th>
                          <th>Created Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {merchantCategories.map((category) => {
                          const productCount = products.filter(
                            (p) => p.category_id === category.category_id
                          ).length;

                          return (
                            <tr key={category.category_id}>
                              <td>{category.category_id}</td>

                              <td className={cx("category-name")}>
                                {category.name}
                              </td>
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
                              <td>
                                <button
                                  className={cx("btn", "btn-sm", "btn-edit")}
                                  onClick={() =>
                                    openCategoryModal(merchant, category)
                                  }
                                >
                                  Edit
                                </button>
                                <button
                                  className={cx("btn", "btn-sm", "btn-delete")}
                                  onClick={() =>
                                    deleteCategory(category.category_id)
                                  }
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
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
                  {customers
                    .filter(
                      (customer) =>
                        customer.customer_name
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        customer.phone
                          ?.toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        customer.email
                          ?.toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        customer.address
                          ?.toLowerCase()
                          .includes(searchTerm.toLowerCase())
                    )
                    .map((customer) => {
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
              <h2 className={cx("section-title")}>Order List by Merchant</h2>
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

            {/* Group orders by merchant */}
            {merchants.map((merchant) => {
              const merchantOrders = orders
                .filter((o) => o.merchant_id === merchant.merchant_id)
                .filter(
                  (order) =>
                    (paymentFilter === "all" ||
                      order.payment?.[0]?.method?.toLowerCase() ===
                        paymentFilter) &&
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
                <div
                  key={merchant.merchant_id}
                  className={cx("merchant-section")}
                >
                  <h3 className={cx("merchant-title")}>
                    {merchant.merchant_name}
                  </h3>
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
                                <span className={cx("badge", "momo")}>
                                  💳 MoMo
                                </span>
                              ) : order.payment?.[0]?.method?.toLowerCase() ===
                                "cod" ? (
                                <span className={cx("badge", "cod")}>
                                  💵 COD
                                </span>
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
        )}
      </div>

      {/* Merchant Modal */}
      {showMerchantModal && (
        <div className={cx("modal-overlay")} onClick={closeMerchantModal}>
          <div className={cx("modal")} onClick={(e) => e.stopPropagation()}>
            <div className={cx("modal-header")}>
              <h3>{editingMerchant ? "Edit Merchant" : "Add New Merchant"}</h3>
              <button
                className={cx("modal-close")}
                onClick={closeMerchantModal}
              >
                ✕
              </button>
            </div>
            <div className={cx("modal-body")}>
              <div className={cx("form-group")}>
                <label>Merchant Name *</label>
                <input
                  type="text"
                  name="merchant_name"
                  value={merchantForm.merchant_name}
                  onChange={handleMerchantFormChange}
                  placeholder="Enter merchant name"
                />
              </div>
              <div className={cx("form-group")}>
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  value={merchantForm.address}
                  onChange={handleMerchantFormChange}
                  placeholder="Enter address"
                />
              </div>
              <div className={cx("form-row")}>
                <div className={cx("form-group")}>
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={merchantForm.phone}
                    onChange={handleMerchantFormChange}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className={cx("form-group")}>
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={merchantForm.email}
                    onChange={handleMerchantFormChange}
                    placeholder="Enter email"
                  />
                </div>
              </div>
              <div className={cx("form-group", "checkbox")}>
                <input
                  type="checkbox"
                  id="status"
                  name="status"
                  checked={merchantForm.status}
                  onChange={handleMerchantFormChange}
                />
                <label htmlFor="status">Active</label>
              </div>
            </div>
            <div className={cx("modal-footer")}>
              <button
                className={cx("btn", "btn-secondary")}
                onClick={closeMerchantModal}
              >
                Cancel
              </button>
              <button
                className={cx("btn", "btn-primary")}
                onClick={saveMerchant}
              >
                {editingMerchant ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showProductModal && (
        <div className={cx("modal-overlay")} onClick={closeProductModal}>
          <div className={cx("modal")} onClick={(e) => e.stopPropagation()}>
            <div className={cx("modal-header")}>
              <h3>{editingProduct ? "Edit Product" : "Add New Product"}</h3>
              <button className={cx("modal-close")} onClick={closeProductModal}>
                ✕
              </button>
            </div>
            <div className={cx("modal-body")}>
              <div className={cx("form-group")}>
                <label>Product Name *</label>
                <input
                  type="text"
                  name="product_name"
                  value={productForm.product_name}
                  onChange={handleProductFormChange}
                  placeholder="Enter product name"
                />
              </div>
              <div className={cx("form-row")}>
                <div className={cx("form-group")}>
                  <label>Price *</label>
                  <input
                    type="number"
                    name="price"
                    value={productForm.price}
                    onChange={handleProductFormChange}
                    placeholder="Enter price"
                    min="0"
                  />
                </div>
                <div className={cx("form-group")}>
                  <label>Category *</label>
                  <select
                    name="category_id"
                    value={productForm.category_id}
                    onChange={handleProductFormChange}
                  >
                    <option value="">Select a category</option>
                    {categories
                      .filter(
                        (c) =>
                          c.merchant_id === productModalMerchant?.merchant_id
                      )
                      .map((category) => (
                        <option
                          key={category.category_id}
                          value={category.category_id}
                        >
                          {category.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
              <div className={cx("form-group")}>
                <label>Description</label>
                <input
                  type="text"
                  name="description"
                  value={productForm.description}
                  onChange={handleProductFormChange}
                  placeholder="Enter description"
                />
              </div>
              <div className={cx("form-group")}>
                <label>Image URL</label>
                <input
                  type="text"
                  name="image"
                  value={productForm.image}
                  onChange={handleProductFormChange}
                  placeholder="Enter image URL"
                />
              </div>
            </div>
            <div className={cx("modal-footer")}>
              <button
                className={cx("btn", "btn-secondary")}
                onClick={closeProductModal}
              >
                Cancel
              </button>
              <button
                className={cx("btn", "btn-primary")}
                onClick={saveProduct}
              >
                {editingProduct ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className={cx("modal-overlay")} onClick={closeCategoryModal}>
          <div className={cx("modal")} onClick={(e) => e.stopPropagation()}>
            <div className={cx("modal-header")}>
              <h3>{editingCategory ? "Edit Category" : "Add New Category"}</h3>
              <button
                className={cx("modal-close")}
                onClick={closeCategoryModal}
              >
                ✕
              </button>
            </div>
            <div className={cx("modal-body")}>
              <div className={cx("form-group")}>
                <label>Category Name *</label>
                <input
                  type="text"
                  name="name"
                  value={categoryForm.name}
                  onChange={handleCategoryFormChange}
                  placeholder="Enter category name"
                />
              </div>
            </div>
            <div className={cx("modal-footer")}>
              <button
                className={cx("btn", "btn-secondary")}
                onClick={closeCategoryModal}
              >
                Cancel
              </button>
              <button
                className={cx("btn", "btn-primary")}
                onClick={saveCategory}
              >
                {editingCategory ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
