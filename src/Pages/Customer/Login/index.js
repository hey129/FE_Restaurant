import { useState } from "react";
import classNames from "classnames/bind";
import styles from "./Login.module.scss";

const cx = classNames.bind(styles);

export default function Login({ onSubmit }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(form); // callback cho parent nếu cần
    console.log("Login:", form);
  };

  return (
    <section className={cx("section")}>
      <div className={cx("container")}>
        <div className={cx("card")}>
          <div className={cx("cardBody")}>
            <h3 className={cx("title")}>Log in</h3>

            <form onSubmit={handleSubmit} className={cx("form")}>
              <div className={cx("formGroup")}>
                <label htmlFor="email">Email</label>
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

              <div className={cx("formGroup")}>
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
              </div>

              <button className={cx("btn", "btnPrimary")} type="submit">
                Login
              </button>
            </form>

            <hr className={cx("divider")} />

            <button className={cx("btn", "btnGoogle")} type="button">
              {/* icon đơn giản bằng svg, bạn có thể thay bằng FontAwesome */}
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className={cx("icon")}
              >
                <path
                  fill="currentColor"
                  d="M21.35 11.1H12v2.9h5.3c-.23 1.5-1.78 4.4-5.3 4.4a5.9 5.9 0 1 1 0-11.8 5.1 5.1 0 0 1 3.6 1.4l2-2A8.4 8.4 0 0 0 12 4a9 9 0 1 0 0 18c5.2 0 8.6-3.6 8.6-8.6 0-.6-.07-1.2-.25-1.7z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>

            <button className={cx("btn", "btnFacebook")} type="button">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className={cx("icon")}
              >
                <path
                  fill="currentColor"
                  d="M13 20v-7h2.3l.3-3H13V8.2c0-.9.3-1.5 1.6-1.5H16V4.1C15.7 4 14.8 4 13.8 4 11.6 4 10 5.3 10 7.9V10H8v3h2v7h3z"
                />
              </svg>
              <span>Sign in with Facebook</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
