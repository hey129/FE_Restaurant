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
  const [showModal, setShowModal] = useState(false);
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
    setShowModal(true);
  };

  const handleEditCategory = (category) => {
    setFormData({
      name: category.name,
    });
    setEditingId(category.category_id);
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
    if (!formData.name.trim()) {
      toast.error("Please enter category name");
      return;
    }

    try {
      if (editingId) {
        await updateMerchantCategory({
          categoryId: editingId,
          name: formData.name,
        });
        toast.success("Category updated!");
      } else {
        await createMerchantCategory({
          merchantId,
          name: formData.name,
        });
        toast.success("Category created!");
      }
      closeModal();
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

      {/* Category Modal */}
      {showModal && (
        <div className={cx("modal-overlay")} onClick={closeModal}>
          <div className={cx("modal")} onClick={(e) => e.stopPropagation()}>
            <div className={cx("modal-header")}>
              <h3>{editingId ? "Edit Category" : "Add New Category"}</h3>
              <button className={cx("modal-close")} onClick={closeModal}>
                ✕
              </button>
            </div>
            <div className={cx("modal-body")}>
              <div className={cx("form-group")}>
                <label>Category Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="Enter category name"
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

export default CategoryManagement;
