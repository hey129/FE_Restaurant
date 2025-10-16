// ~/Pages/Customer/ProfileLayout.jsx
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import CustomerProfileSidebar from "~/Layout/Components/CustomerProfileSidebar";
import classNames from "classnames/bind";
import styles from "./Profile.module.scss";
import { useEffect } from "react";
// Bạn có thể tạo file scss này để chia layout

const cx = classNames.bind(styles);

export default function ProfilePage() {
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    if (loc.pathname === "/profile") {
      nav("customerprofile", { replace: true });
    }
  }, [loc.pathname, nav]);
  return (
    <div className={cx("wrapper")}>
      <div className={cx("container")}>
        <CustomerProfileSidebar />
        <main className={cx("content")}>
          {/* Nội dung của các route con sẽ được render ở đây */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
