import PaymentSuccess from "~/Layout/Components/Customer/PaymentSuccess";
import classNames from "classnames/bind";
import styles from "./PaymentSuccess.module.scss";

const cx = classNames.bind(styles);

export default function PaymentSuccessPage() {
  return (
    <div className={cx("container")}>
      <div className={cx("PaymentSuccess")}>
        <PaymentSuccess />
      </div>
    </div>
  );
}
