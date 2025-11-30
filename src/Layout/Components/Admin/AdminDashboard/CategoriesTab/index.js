import { useState, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "../AdminDashboard.module.scss";
import {
  getAllCategories,
  getAllProducts,
  getMerchants,
  createMerchantCategory,
  updateMerchantCategory,
  deleteMerchantCategory,
} from "~/Api";
import toast from "react-hot-toast";
import { useRealtimeData } from "~/hooks/useRealtimeData";

const cx = classNames.bind(styles);

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

function CategoriesTab() {
  // Local state management
  const [categories, setCategories] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
  });
  const [categoryModalMerchant, setCategoryModalMerchant] = useState(null);

  // Load all data on mount
  useEffect(() => {
    const loadAllData = async () => {
      try {
        await Promise.all([loadCategories(), loadMerchants(), loadProducts()]);
      } catch (err) {
        console.error("Load data error:", err);
      }
    };
    loadAllData();
  }, []);

  // Listen for real-time changes
  useRealtimeData("category", () => {
    console.log("[CategoriesTab] Category data changed, reloading...");
    loadCategories();
  });

  useRealtimeData("merchant", () => {
    console.log("[CategoriesTab] Merchant data changed, reloading...");
    loadMerchants();
  });

  useRealtimeData("product", () => {
    console.log("[CategoriesTab] Product data changed, reloading...");
    loadProducts();
  });

  const loadCategories = async () => {
    try {
      const data = await getAllCategories();
      setCategories(data || []);
    } catch (err) {
      console.error("Load categories error:", err);
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
      const data = await getAllProducts();
      setProducts(data || []);
    } catch (err) {
      console.error("Load products error:", err);
    }
  };
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
      toast.error("Vui lòng nhập tên danh mục", { duration: 2000 });
      return;
    }

    try {
      if (editingCategory) {
        await updateMerchantCategory({
          categoryId: editingCategory.category_id,
          name: categoryForm.name,
        });
        toast.success("Cập nhật danh mục thành công", { duration: 2000 });
      } else {
        await createMerchantCategory({
          merchantId: categoryModalMerchant.merchant_id,
          name: categoryForm.name,
        });
        toast.success("Tạo danh mục thành công", { duration: 2000 });
      }
      closeCategoryModal();
      loadCategories();
    } catch (err) {
      console.error("Save category error:", err);
      toast.error("Lỗi khi lưu danh mục", { duration: 2000 });
    }
  };

  const deleteCategory = async (categoryId) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa danh mục này?")) return;

    try {
      await deleteMerchantCategory({ categoryId });
      toast.success("Xóa danh mục thành công", { duration: 2000 });
      loadCategories();
    } catch (err) {
      console.error("Delete category error:", err);
      toast.error("Lỗi khi xóa danh mục", { duration: 2000 });
    }
  };

  return (
    <div className={cx("table-container")}>
      <div className={cx("section-header")}>
        <h2 className={cx("section-title")}>Category List by Merchant</h2>
        <input
          type="text"
          placeholder="Search categories..."
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
          const merchantCategories = (categories || [])
            .filter((c) => c.merchant_id === merchant.merchant_id)
            .filter((c) =>
              c.name.toLowerCase().includes((searchTerm || "").toLowerCase())
            );
          if (merchantCategories.length === 0) return null;

          return (
            <div key={merchant.merchant_id} className={cx("merchant-section")}>
              <div className={cx("merchant-header")}>
                <h3 className={cx("merchant-title")}>
                  {merchant.merchant_name}
                </h3>

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
                      const productCount = (products || []).filter(
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
                              {category.status ? "Active" : "Inactive"}
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
        })
      ) : (
        <div className={cx("empty-state")}>
          <p>No merchants or categories found</p>
        </div>
      )}

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

export default CategoriesTab;
