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

const cx = classNames.bind(styles);

function ProductManagement({ merchant }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
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
    setShowForm(true);
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
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateMerchantProduct({
          productId: editingId,
          ...formData,
        });
        toast.success("Product updated!");
      } else {
        await createMerchantProduct({
          merchantId,
          ...formData,
        });
        toast.success("Product created!");
      }
      setShowForm(false);
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

      {showForm && (
        <form className={cx("form")} onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Product Name"
            value={formData.productName}
            onChange={(e) =>
              setFormData({ ...formData, productName: e.target.value })
            }
            required
          />
          <input
            type="number"
            placeholder="Price"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
            required
          />
          <select
            value={formData.categoryId}
            onChange={(e) =>
              setFormData({ ...formData, categoryId: e.target.value })
            }
            required
            className={cx("category-select")}
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category.category_id} value={category.category_id}>
                {category.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Image URL"
            value={formData.image}
            onChange={(e) =>
              setFormData({ ...formData, image: e.target.value })
            }
          />
          <div className={cx("form-buttons")}>
            <button type="submit">Save</button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className={cx("btn-cancel")}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

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
    </div>
  );
}

export default ProductManagement;
