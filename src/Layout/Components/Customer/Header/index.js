import classNames from "classnames/bind";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Header.module.scss";
import Button from "~/Layout/Components/Button";
import { useAuth } from "~/Api"; // 1. Import hook useAuth

const cx = classNames.bind(styles);

function Header() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout(); // Gọi hàm logout từ context
      window.location.href = "/";
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleProfile = () => {
    navigate("/profile");
  };

  const handleRegistry = () => {
    navigate("/registry");
  };

  return (
    <header className={cx("header")}>
      <div className={cx("container")}>
        <nav className={cx("nav")}>
          {/* Logo */}
          <div className={cx("logo")}>
            <Link to="/" title="Home">
              PIZZA
            </Link>
          </div>

          {/* Links desktop */}
          <div className={cx("nav-links")}>
            <Link to="/">MENU</Link>
            <Link to="/cart">CART</Link>
          </div>

          {/* Actions */}
          <div className={cx("actions")}>
            {/* 3. Dùng `isAuthenticated` để kiểm tra thay vì `currentUser` */}
            {isAuthenticated ? (
              <div className={cx("currentusers")}>
                <Button className={cx("btn-account")} onClick={handleProfile}>
                  {user && user.customer_name}
                </Button>
                {/* 5. Gắn hàm logout vào nút */}
                <Button onClick={handleLogout} className={cx("btn-logout")}>
                  LOGOUT
                </Button>
              </div>
            ) : (
              // Phần này không thay đổi
              <>
                <Button className={cx("btn-login")} onClick={handleLogin}>
                  LOGIN
                </Button>
                <Button className={cx("btn-registry")} onClick={handleRegistry}>
                  REGISTRY
                </Button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Header;
