import Return from "~/Layout/Components/Button/Return";
import OrderDetail from "~/Layout/Components/Customer/OrderDetail";
import classNames from "classnames/bind";
import styles from "./OrderDetail.module.scss";

const cx = classNames.bind(styles);
export default function OrderDetailPage() {
  return (
    <div className={cx("container")}>
      <div className={cx("OrderDetail")}>
        <OrderDetail />
      </div>
      <Return />
    </div>
  );
}
