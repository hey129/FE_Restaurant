import { useState, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "../AdminDashboard.module.scss";
import toast from "react-hot-toast";
import {
  getMerchants,
  createMerchant,
  updateMerchant,
  deleteMerchant,
} from "~/Api";

const cx = classNames.bind(styles);

function MerchantsTab() {
  // Local state management
  const [merchants, setMerchants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showMerchantModal, setShowMerchantModal] = useState(false);
  const [editingMerchant, setEditingMerchant] = useState(null);
  const [merchantForm, setMerchantForm] = useState({
    merchant_name: "",
    address: "",
    phone: "",
    email: "",
    status: true,
  });

  // Load merchants on mount
  useEffect(() => {
    loadMerchants();
  }, []);

  const loadMerchants = async () => {
    try {
      const data = await getMerchants();
      setMerchants(data || []);
    } catch (err) {
      console.error("Load merchants error:", err);
    }
  };

  // Open merchant modal for creating or editing
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

  // Close merchant modal
  const closeMerchantModal = () => {
    setShowMerchantModal(false);
    setEditingMerchant(null);
  };

  // Handle form input changes
  const handleMerchantFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMerchantForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Save merchant (create or update)
  const saveMerchant = async () => {
    if (!merchantForm.merchant_name.trim()) {
      toast.error("Vui lòng nhập tên quán", { duration: 2000 });
      return;
    }

    try {
      if (editingMerchant) {
        await updateMerchant(editingMerchant.merchant_id, merchantForm);
        toast.success("Cập nhật quán thành công", { duration: 2000 });
      } else {
        await createMerchant(merchantForm);
        toast.success("Tạo quán thành công", { duration: 2000 });
      }

      closeMerchantModal();
      loadMerchants();
    } catch (err) {
      console.error("Save merchant error:", err);
      toast.error("Lỗi khi lưu quán", { duration: 2000 });
    }
  };

  // Delete merchant
  const deleteMerchantFn = async (merchantId) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa quán này?")) return;

    try {
      await deleteMerchant(merchantId);
      toast.success("Xóa quán thành công", { duration: 2000 });
      loadMerchants();
    } catch (err) {
      console.error("Delete merchant error:", err);
      toast.error("Lỗi khi xóa quán", { duration: 2000 });
    }
  };

  // Filter merchants based on search term
  const filteredMerchants = merchants.filter(
    (merchant) =>
      merchant.merchant_name
        .toLowerCase()
        .includes((searchTerm || "").toLowerCase()) ||
      merchant.phone
        ?.toLowerCase()
        .includes((searchTerm || "").toLowerCase()) ||
      merchant.email
        ?.toLowerCase()
        .includes((searchTerm || "").toLowerCase()) ||
      merchant.address?.toLowerCase().includes((searchTerm || "").toLowerCase())
  );

  return (
    <>
      {/* Merchants Table Container */}
      <div className={cx("table-container")}>
        {/* Section Header */}
        <div className={cx("section-header")}>
          <h2 className={cx("section-title")}>Merchant Management</h2>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Search merchants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cx("search-input")}
              style={{
                padding: "8px 12px",
                borderRadius: "4px",
                border: "1px solid #ddd",
                minWidth: "200px",
              }}
            />
            <button
              className={cx("btn", "btn-primary")}
              onClick={() => openMerchantModal()}
            >
              Add Merchant
            </button>
          </div>
        </div>

        {/* Table */}
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
              {filteredMerchants.length > 0 ? (
                filteredMerchants.map((merchant) => (
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
                        {merchant.status ? "Active" : "Inactive"}
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
                        onClick={() => deleteMerchantFn(merchant.merchant_id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    No merchants found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Merchant Modal for Create/Edit */}
      {showMerchantModal && (
        <div className={cx("modal-overlay")} onClick={closeMerchantModal}>
          <div className={cx("modal")} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className={cx("modal-header")}>
              <h3>{editingMerchant ? "Edit Merchant" : "Add New Merchant"}</h3>
              <button
                className={cx("modal-close")}
                onClick={closeMerchantModal}
              >
                ✕
              </button>
            </div>

            {/* Modal Body - Form */}
            <div className={cx("modal-body")}>
              {/* Merchant Name Field */}
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

              {/* Address Field */}
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

              {/* Phone and Email Fields */}
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

              {/* Status Checkbox */}
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

            {/* Modal Footer */}
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
    </>
  );
}

export default MerchantsTab;
