import classNames from "classnames/bind";
import styles from "./Header.module.scss";
import { FaPizzaSlice } from "react-icons/fa";
import Button from "~/Layout/Components/Button";

const cx = classNames.bind(styles);
const currentUser = true;
function Header() {
  return (
    <header className={cx("header")}>
      <div className={cx("container")}>
        {/* NAVBAR */}
        <nav className={cx("nav")}>
          {/* Logo */}
          <div className={cx("logo")}>
            <a href="#" title="Home">
              <FaPizzaSlice />
              PIZZA
            </a>
          </div>

          {/* Links desktop */}
          <div className={cx("nav-links")}>
            <a href="#">MENU</a>
            <a href="#">CART</a>
          </div>
          <div className={cx("actions")}>
            {currentUser ? (
              <div className={cx("currentusers")}>
                <Button className={cx("btn-account")}>username</Button>
                <Button className={cx("btn-logout")}>LOGOUT</Button>
              </div>
            ) : (
              <>
                <Button className={cx("btn-login")}>LOGIN</Button>
                <Button className={cx("btn-registry")}>REGISTRY</Button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Header;
