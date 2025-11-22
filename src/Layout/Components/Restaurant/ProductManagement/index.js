import { useState, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./ProductManagement.module.scss";
import {
  getMerchantProducts,
  createMerchantProduct,
  updateMerchantProduct,
  deleteMerchantProduct,
  getMerchantCategories,
} from "~/Api";
import toast, { Toaster } from "react-hot-toast";
import { useRealtimeData } from "~/hooks/useRealtimeData";

const cx = classNames.bind(styles);

function ProductManagement({ merchant }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    productName: "",
    price: "",
    categoryId: "",
    description: "",
    image: "",
  });

  const merchantId = merchant?.merchant_id;

  useEffect(() => {
    if (merchantId) {
      loadCategories();
      loadProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [merchantId]);

  // Listen for real-time changes in product table
  useRealtimeData("product", () => {
    console.log("[ProductManagement] Product data changed, reloading...");
    loadProducts();
  });

  // Listen for real-time changes in category table
  useRealtimeData("category", () => {
    console.log("[ProductManagement] Category data changed, reloading...");
    loadCategories();
  });

  const loadCategories = async () => {
    try {
      const data = await getMerchantCategories({ merchantId });
      setCategories(data);
    } catch (error) {
      console.error("❌ Error loading categories:", error);
      toast.error(`Failed to load categories: ${error.message}`);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      if (!merchantId) {
        console.error("❌ Merchant ID not found:", { merchant });
        toast.error("Merchant ID not found");
        return;
      }

      console.log("🔄 Loading products for merchant:", merchantId);
      const data = await getMerchantProducts({ merchantId });
      console.log("✅ Products loaded:", data);
      setProducts(data);
    } catch (error) {
      console.error("❌ Error loading products:", error);
      toast.error(`Failed to load products: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setFormData({
      productName: "",
      price: "",
      categoryId: "",
      description: "",
      image: "",
    });
    setEditingId(null);
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setFormData({
      productName: product.product_name,
      price: product.price,
      categoryId: product.category_id,
      description: product.description,
      image: product.image,
    });
    setEditingId(product.product_id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.productName.trim()) {
      toast.error("Please enter product name");
      return;
    }
    if (!formData.categoryId) {
      toast.error("Please select a category");
      return;
    }

    try {
      if (editingId) {
        await updateMerchantProduct({
          productId: editingId,
          productName: formData.productName,
          price: formData.price,
          categoryId: formData.categoryId,
          description: formData.description,
          image: formData.image,
        });
        toast.success("Product updated!");
      } else {
        await createMerchantProduct({
          merchantId,
          productName: formData.productName,
          price: formData.price,
          categoryId: formData.categoryId,
          description: formData.description,
          image: formData.image,
        });
        toast.success("Product created!");
      }
      closeModal();
      loadProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product");
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await deleteMerchantProduct({ productId });
      toast.success("Product deleted!");
      loadProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  if (loading) {
    return (
      <div className={cx("container")}>
        <div className={cx("loading")}>Loading products...</div>
      </div>
    );
  }

  return (
    <div className={cx("container")}>
      <Toaster position="top-right" />

      <div className={cx("header")}>
        <h2>Products</h2>
        <button className={cx("btn-add")} onClick={handleAddProduct}>
          + Add Product
        </button>
      </div>

      <div className={cx("products-list")}>
        {products.length === 0 ? (
          <p>No products found. Create your first product!</p>
        ) : (
          products.map((product) => (
            <div key={product.product_id} className={cx("product-card")}>
              {product.image && (
                <img
                  src={product.image}
                  alt={product.product_name}
                  className={cx("product-image")}
                />
              )}
              <div className={cx("product-info")}>
                <h3>{product.product_name}</h3>
                <p>{product.description}</p>
                <p className={cx("price")}>
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(product.price)}
                </p>
              </div>
              <div className={cx("product-actions")}>
                <button
                  className={cx("btn-edit")}
                  onClick={() => handleEditProduct(product)}
                >
                  Edit
                </button>
                <button
                  className={cx("btn-delete")}
                  onClick={() => handleDeleteProduct(product.product_id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Product Modal */}
      {showModal && (
        <div className={cx("modal-overlay")} onClick={closeModal}>
          <div className={cx("modal")} onClick={(e) => e.stopPropagation()}>
            <div className={cx("modal-header")}>
              <h3>{editingId ? "Edit Product" : "Add New Product"}</h3>
              <button className={cx("modal-close")} onClick={closeModal}>
                ✕
              </button>
            </div>
            <div className={cx("modal-body")}>
              <div className={cx("form-group")}>
                <label>Product Name *</label>
                <input
                  type="text"
                  name="productName"
                  value={formData.productName}
                  onChange={handleFormChange}
                  placeholder="Enter product name"
                />
              </div>
              <div className={cx("form-row")}>
                <div className={cx("form-group")}>
                  <label>Price *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleFormChange}
                    placeholder="Enter price"
                    min="0"
                  />
                </div>
                <div className={cx("form-group")}>
                  <label>Category *</label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleFormChange}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
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
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Enter description"
                />
              </div>
              <div className={cx("form-group")}>
                <label>Image URL</label>
                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleFormChange}
                  placeholder="Enter image URL"
                />
              </div>
            </div>
            <div className={cx("modal-footer")}>
              <button className={cx("btn-cancel")} onClick={closeModal}>
                Cancel
              </button>
              <button className={cx("btn-submit")} onClick={handleSubmit}>
                {editingId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductManagement;
