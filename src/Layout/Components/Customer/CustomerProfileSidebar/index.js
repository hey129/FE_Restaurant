// ~/Layout/Components/CustomerProfileSidebar.jsx
import { NavLink } from "react-router-dom"; // Dùng NavLink sẽ tiện hơn cho active class
import classNames from "classnames/bind";
import styles from "./CustomerProfileSidebar.module.scss";

const cx = classNames.bind(styles);

export default function CustomerProfileSideBar() {
  return (
    <aside className={cx("sidebar")}>
      <div className={cx("card")}>
        <div className={cx("header")}>
          <h3 className={cx("title")}>Account</h3>
        </div>
        <ul className={cx("list")}>
          <li>
            {/* Use "." to point to the index route, or "customerprofile" for explicit path */}
            <NavLink
              to="customerprofile"
              end
              className={({ isActive }) => cx("item", { active: isActive })}
            >
              Customer Profile
            </NavLink>
          </li>
          <li>
            {/* Bỏ dấu "/" ở đầu */}
            <NavLink
              to="order"
              end
              className={({ isActive }) => cx("item", { active: isActive })}
            >
              Orders
            </NavLink>
          </li>
        </ul>
      </div>
    </aside>
  );
}
