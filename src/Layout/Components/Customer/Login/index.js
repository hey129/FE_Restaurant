import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import classNames from "classnames/bind";
import styles from "./Login.module.scss";
import Button from "~/Layout/Components/Button";
import { useAuth } from "~/Api";

const cx = classNames.bind(styles);

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const next = new URLSearchParams(location.search).get("next") || "/"; // 2. Lấy hàm login từ context

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({}); // State cho lỗi của từng trường
  const [msg, setMsg] = useState({ type: "", text: "" }); // State cho thông báo chung

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    const newErrors = {};

    if (!form.email) {
      newErrors.email = "Email is required.";
    }

    if (!form.password) {
      newErrors.password = "Password is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    // --- Kết thúc Validation ---

    setErrors({});
    setSubmitting(true);

    try {
      await login({ email: form.email, password: form.password });
      // Quay lại trang trước nếu có `next`, mặc định về home
      navigate(next || "/");
    } catch (err) {
      console.error("Login error:", err);
      // If error from server (e.g., wrong email/password), display specific message
      setMsg({
        type: "error",
        text: err.message || "Login failed. Please check your information.",
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
            <h3 className={cx("title")}>Log in</h3>

            <form onSubmit={handleSubmit} className={cx("form")}>
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
                {/* Display email field error */}
                {errors.email && (
                  <p className={cx("error-text")}>{errors.email}</p>
                )}
              </div>

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
                />
                {/* Hiển thị lỗi của trường password */}
                {errors.password && (
                  <p className={cx("error-text")}>{errors.password}</p>
                )}
              </div>
              {msg.type === "error" && msg.text && (
                <div className={cx("error-text", "error")} role="alert">
                  {msg.text}
                </div>
              )}

              <Button
                className={cx("btn", "btnPrimary")}
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Logging in..." : "Login"}
              </Button>

              {/* Di chuyển thông báo lỗi xuống cuối form, chỉ hiển thị nếu có lỗi từ server (type: "error") */}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
