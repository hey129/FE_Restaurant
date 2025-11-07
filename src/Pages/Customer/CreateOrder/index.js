// src/Pages/Customer/CreateOrder/index.js
import Return from "~/Layout/Components/Button/Return";
import OrderCreate from "~/Layout/Components/Customer/CreateOrder";
import classNames from "classnames/bind";
import styles from "./CreateOrder.module.scss";

const cx = classNames.bind(styles);
export default function OrderCreatePage() {
  return (
    <div className={cx("container")}>
      <div className={cx("OrderCreate")}>
        <OrderCreate />
      </div>
      <Return />
    </div>
  );
}
