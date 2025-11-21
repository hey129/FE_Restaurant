import { useState } from "react";
import { useNavigate } from "react-router-dom";
import classNames from "classnames/bind";
import styles from "./MerchantLogin.module.scss";
import { useAuth } from "~/Api";
import toast, { Toaster } from "react-hot-toast";

const cx = classNames.bind(styles);

export default function MerchantLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error("Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      await login({ email: form.email, password: form.password });
      toast.success("Login successful!");
      navigate("/restaurant");
    } catch (error) {
      console.error("Login error:", error);
      toast.error(
        error.message || "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={cx("login-section")}>
      <Toaster position="top-right" />
      <div className={cx("login-container")}>
        <div className={cx("login-card")}>
          <h1 className={cx("title")}>Merchant Dashboard</h1>
          <p className={cx("subtitle")}>Login to manage your restaurant</p>

          <form className={cx("form")} onSubmit={handleSubmit}>
            <div className={cx("form-group")}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="merchant@example.com"
                disabled={loading}
              />
            </div>

            <div className={cx("form-group")}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className={cx("btn-submit")}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className={cx("footer")}>
            <p>Don't have an account? Contact administrator</p>
          </div>
        </div>
      </div>
    </section>
  );
}
