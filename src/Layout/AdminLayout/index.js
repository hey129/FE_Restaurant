import classNames from "classnames/bind";
import styles from "./AdminLayout.module.scss";
import { useAuth } from "~/Api";
import { Toaster } from "react-hot-toast";

const cx = classNames.bind(styles);

function AdminLayout({ children }) {
  const { user } = useAuth();

  return (
    <div className={cx("admin-layout")}>
      <Toaster
        position="top-right"
        gutter={8}
        toastOptions={{ duration: 2000 }}
      />

      {/* Admin Header */}
      <header className={cx("admin-header")}>
        <div className={cx("header-left")}>
          <h1 className={cx("header-title")}>Admin Dashboard</h1>
        </div>
        <div className={cx("header-right")}>
          <span className={cx("user-email")}>{user?.email}</span>
        </div>
      </header>

      {/* Content */}
      <div className={cx("content-wrapper")}>{children}</div>
    </div>
  );
}

export default AdminLayout;
