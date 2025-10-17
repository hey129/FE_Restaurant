import ProductDetail from "~/Layout/Components/Customer/ProductDetail";
import classNames from "classnames/bind";
import styles from "./ProductDetail.module.scss";

const cx = classNames.bind(styles);
export default function ProductDetailPage() {
  return (
    <div className={cx("container")}>
      <div className={cx("ProductDetail")}>
        <ProductDetail />
      </div>
    </div>
  );
}
