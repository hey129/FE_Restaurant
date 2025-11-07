import Cart from "~/Layout/Components/Customer/Cart";
import classNames from "classnames/bind";
import styles from "./Cart.module.scss";

const cx = classNames.bind(styles);
export default function CartPage() {
  return (
    <div className={cx("container")}>
      <div className={cx("Cart")}>
        <Cart />
      </div>
    </div>
  );
}
