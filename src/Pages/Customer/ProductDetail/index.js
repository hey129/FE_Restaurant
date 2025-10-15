import Return from "~/Layout/Components/Button/Return";
import ProductDetail from "~/Layout/Components/ProductDetail";
import classNames from "classnames/bind";
import styles from "./ProductDetail.module.scss";

const cx = classNames.bind(styles);
export default function ProductDetailPage() {
  return (
    <div className={cx("container")}>
      <div className={cx("ProductDetail")}>
        <ProductDetail />
      </div>
      <Return />
    </div>
  );
}
