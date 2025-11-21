import classNames from "classnames/bind";
import { useState, useEffect } from "react";
import styles from "../AdminDashboard.module.scss";
import {
  getAllProducts,
  getAllCategories,
  getMerchants,
  createMerchantProduct,
  updateMerchantProduct,
  deleteMerchantProduct,
} from "~/Api";
import toast from "react-hot-toast";

const cx = classNames.bind(styles);

const formatVND = (n) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Math.round(Number(n) || 0));

function ProductsTab() {
  // Local state management
  const [products, setProducts] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
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

  // Load all data on mount
  useEffect(() => {
    const loadAllData = async () => {
      try {
        await Promise.all([loadProducts(), loadMerchants(), loadCategories()]);
      } catch (err) {
        console.error("Load data error:", err);
      }
    };
    loadAllData();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getAllProducts();
      setProducts(data || []);
    } catch (err) {
      console.error("Load products error:", err);
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

  const loadCategories = async () => {
    try {
      const data = await getAllCategories();
      setCategories(data || []);
    } catch (err) {
      console.error("Load categories error:", err);
    }
  };
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
      toast.error("Vui lòng nhập tên sản phẩm", { duration: 2000 });
      return;
    }
    if (!productForm.category_id) {
      toast.error("Vui lòng chọn danh mục", { duration: 2000 });
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
        toast.success("Cập nhật sản phẩm thành công", { duration: 2000 });
      } else {
        await createMerchantProduct({
          merchantId: productModalMerchant.merchant_id,
          productName: productForm.product_name,
          price: productForm.price,
          categoryId: productForm.category_id,
          description: productForm.description,
          image: productForm.image,
        });
        toast.success("Tạo sản phẩm thành công", { duration: 2000 });
      }
      closeProductModal();
      loadProducts();
    } catch (err) {
      console.error("Save product error:", err);
      toast.error("Lỗi khi lưu sản phẩm", { duration: 2000 });
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa sản phẩm này?")) return;

    try {
      await deleteMerchantProduct({ productId });
      toast.success("Xóa sản phẩm thành công", { duration: 2000 });
      loadProducts();
    } catch (err) {
      console.error("Delete product error:", err);
      toast.error("Lỗi khi xóa sản phẩm", { duration: 2000 });
    }
  };

  return (
    <div className={cx("table-container")}>
      <div className={cx("section-header")}>
        <h2 className={cx("section-title")}>Product List by Merchant</h2>
        <input
          type="text"
          placeholder="Search products..."
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
      {merchants && Array.isArray(merchants) && merchants.length > 0 ? (
        merchants.map((merchant) => {
          const merchantProducts = (products || [])
            .filter((p) => p.merchant_id === merchant.merchant_id)
            .filter(
              (p) =>
                p.product_name
                  .toLowerCase()
                  .includes((searchTerm || "").toLowerCase()) ||
                p.category?.name
                  ?.toLowerCase()
                  .includes((searchTerm || "").toLowerCase()) ||
                p.description
                  ?.toLowerCase()
                  .includes((searchTerm || "").toLowerCase())
            );
          if (merchantProducts.length === 0) return null;

          return (
            <div key={merchant.merchant_id} className={cx("merchant-section")}>
              <div className={cx("merchant-header")}>
                <h3 className={cx("merchant-title")}>
                  {merchant.merchant_name}
                </h3>
                <button
                  className={cx("btn", "btn-sm", "btn-primary")}
                  onClick={() => openProductModal(merchant)}
                >
                  + Add Product
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
                            {product.rating || "Chưa có"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={cx(
                              "status-badge",
                              product.status ? "active" : "inactive"
                            )}
                          >
                            {product.status ? "Hoạt động" : "Không hoạt động"}
                          </span>
                        </td>
                        <td className={cx("description")}>
                          {product.description || "No description"}
                        </td>
                        <td>
                          <button
                            className={cx("btn", "btn-sm", "btn-edit")}
                            onClick={() => openProductModal(merchant, product)}
                          >
                            Edit
                          </button>
                          <button
                            className={cx("btn", "btn-sm", "btn-delete")}
                            onClick={() => deleteProduct(product.product_id)}
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
        })
      ) : (
        <div className={cx("empty-state")}>
          <p>No merchants or products found</p>
        </div>
      )}

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
    </div>
  );
}

export default ProductsTab;
