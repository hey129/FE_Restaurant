import CustomerProfile from "~/Layout/Components/Customer/CustomerProfile";
import classNames from "classnames/bind";
import styles from "./CustomerProfile.module.scss";

const cx = classNames.bind(styles);

export default function CustomerProfilePage() {
  return (
    <div className={cx("container")}>
      <div className={cx("CustomerProfile")}>
        <CustomerProfile />
      </div>
    </div>
  );
}
