// src/Pages/Customer/CustomerProfile.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import classNames from "classnames/bind";
import styles from "./CustomerProfile.module.scss";
import { useCustomer, useAuth } from "~/Api";
// (tuỳ chọn) dùng toast
import toast, { Toaster } from "react-hot-toast";

const cx = classNames.bind(styles);

export default function CustomerProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { getCurrentUser, updateProfile } = useCustomer();
  const { changePassword, isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [form, setForm] = useState({
    customer_name: "",
    phone: "",
    address: "",
    status: true,
  });

  const [pwd, setPwd] = useState({ new1: "", new2: "" });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { user, profile } = await getCurrentUser();
        setAuthUser(user);
        setProfile(profile);
        if (user && profile) {
          setForm({
            customer_name: profile.customer_name || "",
            phone: profile.phone || "",
            address: profile.address || "",
            status: profile.status ?? true,
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const createdAt = useMemo(() => {
    if (!profile?.created_at) return "-";
    try {
      return new Date(profile.created_at).toLocaleString("vi-VN");
    } catch {
      return profile.created_at;
    }
  }, [profile?.created_at]);

  if (!isAuthenticated && !loading) {
    const next = location.pathname + location.search + location.hash;
    return (
      <section className={cx("section")}>
        <div className={cx("container")}>
          <div className={cx("card")}>
            <div className={cx("cardBody")}>
              <h3 className={cx("title")}>You are not logged in</h3>
              <p>Please login to view profile.</p>
              <button
                className={cx("btn", "btnPrimary")}
                onClick={() =>
                  navigate(`/login?next=${encodeURIComponent(next)}`)
                }
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className={cx("section")}>
        <div className={cx("container")}>
          <p>Loading profile...</p>
        </div>
      </section>
    );
  }

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (!authUser?.id) return;
      const updated = await updateProfile({
        customer_id: authUser.id,
        ...form,
      });
      setProfile(updated);
      toast.success("Profile updated!", { duration: 2000 });
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Update failed", { duration: 2000 });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!pwd.new1 || pwd.new1.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }
    if (pwd.new1 !== pwd.new2) return toast.error("Passwords do not match");
    try {
      await changePassword(pwd.new1);
      setPwd({ new1: "", new2: "" });
      toast.success("Password changed successfully");
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Failed to change password");
    }
  };

  return (
    <section className={cx("section")}>
      <Toaster position="top-right" />
      <div className={cx("container")}>
        <div className={cx("grid")}>
          {/* BÊN TRÁI: AUTH INFO */}
          <div className={cx("card")}>
            <div className={cx("cardHeader")}>
              <h3 className={cx("title")}>Account (Authentication) </h3>
            </div>
            <div className={cx("cardBody")}>
              <div className={cx("row")}>
                <span className={cx("label")}>User ID </span>
                <span className={cx("value")}>{authUser?.id}</span>
              </div>
              <div className={cx("row")}>
                <span className={cx("label")}>Email </span>
                <span className={cx("value")}>{authUser?.email || "-"}</span>
              </div>
              <div className={cx("row")}>
                <span className={cx("label")}>Created At </span>
                <span className={cx("value")}>{createdAt || "-"}</span>
              </div>
            </div>
          </div>

          {/* BÊN PHẢI: CUSTOMER PROFILE */}
          <div className={cx("card")}>
            <div className={cx("cardHeader")}>
              <h3 className={cx("title")}>
                Customer Profile (public.customer)
              </h3>
            </div>
            <div className={cx("cardBody")}>
              {!profile ? (
                <p>
                  No customer profile. Please update your information below.
                </p>
              ) : null}

              <form onSubmit={handleSave} className={cx("form")}>
                <div className={cx("formGroup")}>
                  <label>Full Name</label>
                  <input
                    name="customer_name"
                    value={form.customer_name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className={cx("formGroup")}>
                  <label>Phone</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="09xx xxx xxx"
                  />
                </div>

                <div className={cx("formGroup")}>
                  <label>Address</label>
                  <input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="House number, street, district, city"
                  />
                </div>

                <button className={cx("btn", "btnPrimary")} type="submit">
                  Save Changes
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
