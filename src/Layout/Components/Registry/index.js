// src/Layout/Components/Registry/index.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import classNames from "classnames/bind";
import styles from "./Registry.module.scss";
import { registerCustomer } from "~/Api";
import Button from "~/Layout/Components/Button";

const cx = classNames.bind(styles);

export default function Registry() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    customer_name: "",
    phone: "",
    address: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));

    if (errors[name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: null }));
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg({ type: "", text: "" }); // Xóa thông báo cũ

    const newErrors = {};
    if (form.password.length < 6) {
      newErrors.password = "At least 6 characters.";
    }
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Unmatched.";
    }

    // Nếu có lỗi, cập nhật state errors và dừng lại
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    // --- KẾT THÚC LOGIC VALIDATION MỚI ---

    setErrors({}); // Xóa hết lỗi nếu validation thành công
    setSubmitting(true);

    try {
      const result = await registerCustomer({
        email: form.email,
        password: form.password,
        customer_name: form.customer_name,
        phone: form.phone,
        address: form.address,
      });

      setMsg({
        type: "success",
        text: result.message || "Đăng ký thành công!",
      });

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error("Registration error:", err);
      setMsg({
        type: "error",
        text: err.message || "Đăng ký thất bại. Vui lòng thử lại.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className={cx("section")}>
      <div className={cx("container")}>
        <div className={cx("card")}>
          <div className={cx("cardBody")}>
            <h3 className={cx("title")}>Create Account</h3>

            {msg.text && (
              <div
                className={cx("alert", {
                  success: msg.type === "success",
                  error: msg.type === "error",
                })}
                role="alert"
              >
                {msg.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className={cx("form")}>
              <div className={cx("grid2")}>
                <div className={cx("formGroup")}>
                  <label htmlFor="customer_name">Full Name *</label>
                  <input
                    id="customer_name"
                    name="customer_name"
                    type="text"
                    value={form.customer_name}
                    onChange={handleChange}
                    placeholder="Nguyễn Văn A"
                    required
                  />
                  {errors.customer_name && (
                    <p className={cx("error-text")}>{errors.customer_name}</p>
                  )}
                </div>

                <div className={cx("formGroup")}>
                  <label htmlFor="phone">Phone</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="09xx xxx xxx"
                    required
                  />
                </div>
              </div>

              <div className={cx("formGroup")}>
                <label htmlFor="address">Address</label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Số nhà, đường, quận/huyện, tỉnh/thành"
                  required
                />
              </div>

              <div className={cx("formGroup")}>
                <label htmlFor="email">Email *</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className={cx("grid2")}>
                <div className={cx("formGroup")}>
                  <label htmlFor="password">Password *</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  {errors.password && (
                    <p className={cx("error-text")}>{errors.password}</p>
                  )}
                </div>

                <div className={cx("formGroup")}>
                  <label htmlFor="confirmPassword">Confirm Password *</label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  {errors.confirmPassword && (
                    <p className={cx("error-text")}>{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <Button
                className={cx("btn", "btnPrimary")}
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Creating account..." : "Register"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
