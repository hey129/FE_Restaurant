import Login from "~/Layout/Components/Customer/Login";
import classNames from "classnames/bind";
import styles from "./Login.module.scss";

const cx = classNames.bind(styles);
export default function LoginPage() {
  return (
    <div className={cx("container")}>
      <div className={cx("LoginPage")}>
        <Login />
      </div>
    </div>
  );
}
