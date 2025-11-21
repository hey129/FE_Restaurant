import { useState, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./CategoryManagement.module.scss";
import {
  getMerchantCategories,
  createMerchantCategory,
  updateMerchantCategory,
  deleteMerchantCategory,
} from "~/Api";
import toast, { Toaster } from "react-hot-toast";

const cx = classNames.bind(styles);

function CategoryManagement({ merchant }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
  });

  const merchantId = merchant?.merchant_id;

  useEffect(() => {
    if (merchantId) {
      loadCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [merchantId]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      if (!merchantId) {
        console.error("❌ Merchant ID not found:", { merchant });
        toast.error("Merchant ID not found");
        return;
      }

      console.log("🔄 Loading categories for merchant:", merchantId);
      const data = await getMerchantCategories({ merchantId });
      console.log("✅ Categories loaded:", data);
      setCategories(data);
    } catch (error) {
      console.error("❌ Error loading categories:", error);
      toast.error(`Failed to load categories: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    setFormData({
      name: "",
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleEditCategory = (category) => {
    setFormData({
      name: category.name,
    });
    setEditingId(category.category_id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateMerchantCategory({
          categoryId: editingId,
          ...formData,
        });
        toast.success("Category updated!");
      } else {
        await createMerchantCategory({
          merchantId,
          ...formData,
        });
        toast.success("Category created!");
      }
      setShowForm(false);
      loadCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Failed to save category");
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await deleteMerchantCategory({ categoryId });
      toast.success("Category deleted!");
      loadCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    }
  };

  if (loading) {
    return (
      <div className={cx("container")}>
        <div className={cx("loading")}>Loading categories...</div>
      </div>
    );
  }

  return (
    <div className={cx("container")}>
      <Toaster position="top-right" />

      <div className={cx("header")}>
        <h2>Categories</h2>
        <button className={cx("btn-add")} onClick={handleAddCategory}>
          + Add Category
        </button>
      </div>

      {showForm && (
        <form className={cx("form")} onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Category Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
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

      <div className={cx("categories-list")}>
        {categories.length === 0 ? (
          <p>No categories found. Create your first category!</p>
        ) : (
          categories.map((category) => (
            <div key={category.category_id} className={cx("category-card")}>
              <div className={cx("category-info")}>
                <h3>{category.name}</h3>
                <span
                  className={cx(
                    "status",
                    category.status ? "active" : "inactive"
                  )}
                >
                  {category.status ? "✓ Active" : "✗ Inactive"}
                </span>
              </div>
              <div className={cx("category-actions")}>
                <button
                  className={cx("btn-edit")}
                  onClick={() => handleEditCategory(category)}
                >
                  Edit
                </button>
                <button
                  className={cx("btn-delete")}
                  onClick={() => handleDeleteCategory(category.category_id)}
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

export default CategoryManagement;
