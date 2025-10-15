import Return from "~/Layout/Components/Button/Return";
import Cart from "~/Layout/Components/Cart";
import classNames from "classnames/bind";
import styles from "./ProductDetail.module.scss";

const cx = classNames.bind(styles);
export default function CartPage() {
  return (
    <div className={cx("container")}>
      <div className={cx("Cart")}>
        <Cart />
      </div>
      <Return />
    </div>
  );
}
