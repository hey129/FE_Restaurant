import { useState } from "react";
import styles from "./ProfileSettings.module.scss";
import { updateMerchantProfile } from "~/Api";
import toast, { Toaster } from "react-hot-toast";

function ProfileSettings({ merchant }) {
  const [formData, setFormData] = useState({
    merchantName: merchant?.merchant_name || "",
    address: merchant?.address || "",
    phone: merchant?.phone || "",
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateMerchantProfile({
        merchantId: merchant?.merchant_id,
        merchantName: formData.merchantName,
        address: formData.address,
        phone: formData.phone,
      });
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <Toaster position="top-right" />

      <h2>Restaurant Profile</h2>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label>Restaurant Name</label>
          <input
            type="text"
            name="merchantName"
            value={formData.merchantName}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <button type="submit" disabled={saving} className={styles.btnSubmit}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

export default ProfileSettings;
