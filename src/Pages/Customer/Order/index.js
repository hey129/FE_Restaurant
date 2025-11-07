import Order from "~/Layout/Components/Customer/Orders";
import classNames from "classnames/bind";
import styles from "./Order.module.scss";

const cx = classNames.bind(styles);

export default function OrderPage() {
  return (
    <div className={cx("container")}>
      <div className={cx("Order")}>
        <Order />
      </div>
    </div>
  );
}
