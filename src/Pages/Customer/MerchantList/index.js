// src/Pages/Customer/MerchantList/index.js
import { useNavigate } from "react-router-dom";
import classNames from "classnames/bind";
import styles from "./MerchantList.module.scss";
import MerchantSelector from "~/Layout/Components/Customer/MerchantSelector";

const cx = classNames.bind(styles);

export default function MerchantListPage() {
  const navigate = useNavigate();

  const handleMerchantSelect = (merchantId) => {
    navigate(`/menu/${merchantId}`);
  };

  return (
    <div className={cx("container")}>
      <div className={cx("content")}>
        <MerchantSelector onMerchantSelect={handleMerchantSelect} />
      </div>
    </div>
  );
}
