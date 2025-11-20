import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import classNames from "classnames/bind";
import styles from "./Menu.module.scss";
import Sidebar from "~/Layout/Components/Customer/MenuSidebar";
import Menu from "~/Layout/Components/Customer/Menu";
import ScrollToTopButton from "~/Layout/Components/Button/ScrollToTop";
import { useAuth } from "~/Api/Auth";

const cx = classNames.bind(styles);

export default function Menupage() {
  const { merchantId: paramMerchantId } = useParams();
  const { merchantId: authMerchantId, switchMerchant } = useAuth();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    category: null,
    search: "",
  });

  // Switch merchant when navigating to this page with a different merchantId
  useEffect(() => {
    if (!paramMerchantId) {
      navigate("/merchants");
    } else if (paramMerchantId !== authMerchantId) {
      switchMerchant(paramMerchantId);
    }
  }, [paramMerchantId, authMerchantId, switchMerchant, navigate]);

  const handleFiltersChange = useCallback((next) => {
    setFilters((prev) => ({ ...prev, ...next }));
  }, []);

  // Show nothing while redirecting
  if (!paramMerchantId) {
    return null;
  }

  return (
    <div className={cx("container")}>
      <div className={cx("sidebar")}>
        <Sidebar onChange={handleFiltersChange} merchantId={paramMerchantId} />
      </div>

      <div className={cx("menu")}>
        <Menu filters={filters} merchantId={paramMerchantId} />
      </div>

      <ScrollToTopButton />
    </div>
  );
}
