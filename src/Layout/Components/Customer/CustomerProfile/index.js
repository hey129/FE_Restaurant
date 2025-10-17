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
              <h3 className={cx("title")}>Bạn chưa đăng nhập</h3>
              <p>Vui lòng đăng nhập để xem hồ sơ.</p>
              <button
                className={cx("btn", "btnPrimary")}
                onClick={() =>
                  navigate(`/login?next=${encodeURIComponent(next)}`)
                }
              >
                Đăng nhập
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
          <p>Đang tải hồ sơ…</p>
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
      toast.success("Đã cập nhật hồ sơ!");
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Cập nhật thất bại");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!pwd.new1 || pwd.new1.length < 6) {
      return toast.error("Mật khẩu tối thiểu 6 ký tự");
    }
    if (pwd.new1 !== pwd.new2)
      return toast.error("Mật khẩu nhập lại không khớp");
    try {
      await changePassword(pwd.new1);
      setPwd({ new1: "", new2: "" });
      toast.success("Đã đổi mật khẩu");
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Đổi mật khẩu thất bại");
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
              <h3 className={cx("title")}>Tài khoản (Authentication) </h3>
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
                Hồ sơ khách hàng (public.customer)
              </h3>
            </div>
            <div className={cx("cardBody")}>
              {!profile ? (
                <p>
                  Chưa có hồ sơ khách hàng. Hãy cập nhật thông tin bên dưới.
                </p>
              ) : null}

              <form onSubmit={handleSave} className={cx("form")}>
                <div className={cx("formGroup")}>
                  <label>Họ và tên</label>
                  <input
                    name="customer_name"
                    value={form.customer_name}
                    onChange={handleChange}
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </div>

                <div className={cx("formGroup")}>
                  <label>Điện thoại</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="09xx xxx xxx"
                  />
                </div>

                <div className={cx("formGroup")}>
                  <label>Địa chỉ</label>
                  <input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Số nhà, đường, quận/huyện, tỉnh/thành"
                  />
                </div>

                <button className={cx("btn", "btnPrimary")} type="submit">
                  Lưu thay đổi
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
