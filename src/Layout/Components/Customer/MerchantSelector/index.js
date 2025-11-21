// src/Layout/Components/Customer/MerchantSelector/index.js
import { useState, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./MerchantSelector.module.scss";
import { getMerchants } from "~/Api/Merchant";
import { useAuth } from "~/Api/Auth";

const cx = classNames.bind(styles);

export default function MerchantSelector({ onMerchantSelect }) {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { merchantId, switchMerchant } = useAuth();
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    let Cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getMerchants();

        if (!Cancelled) {
          setMerchants(data || []);
          // Initialize with first merchant or current merchant
          if (data && data.length > 0) {
            const initialId = merchantId || data[0].merchant_id;
            setSelectedId(initialId);
          }
        }
      } catch (e) {
        if (!Cancelled) {
          const errorMsg = e?.message || "Failed to load merchants";
          setError(errorMsg);
          console.error("Error loading merchants:", e);
        }
      } finally {
        if (!Cancelled) setLoading(false);
      }
    })();

    return () => {
      Cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMerchantClick = (merchant) => {
    setSelectedId(merchant.merchant_id);
    switchMerchant(merchant.merchant_id);
    onMerchantSelect?.(merchant.merchant_id);
  };

  if (loading) {
    return (
      <div className={cx("selector")}>
        <div className={cx("loading")}>Đang tải danh sách nhà hàng...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cx("selector")}>
        <div className={cx("error")}>Lỗi: {error}</div>
      </div>
    );
  }

  if (!merchants || merchants.length === 0) {
    return (
      <div className={cx("selector")}>
        <div className={cx("empty")}>Không có nhà hàng nào</div>
      </div>
    );
  }

  return (
    <div className={cx("selector")}>
      <div className={cx("header")}>
        <h2>Chọn Nhà Hàng</h2>
      </div>

      <div className={cx("grid")}>
        {merchants.map((merchant) => (
          <div
            key={merchant.merchant_id}
            className={cx("card", {
              active: selectedId === merchant.merchant_id,
            })}
            onClick={() => handleMerchantClick(merchant)}
          >
            <div className={cx("card-content")}>
              <div className={cx("merchant-name")}>
                {merchant.merchant_name}
              </div>
              {merchant.address && (
                <div className={cx("merchant-address")}>
                  📍 {merchant.address}
                </div>
              )}
              {merchant.phone && (
                <div className={cx("merchant-phone")}>📞 {merchant.phone}</div>
              )}
            </div>
            {selectedId === merchant.merchant_id && (
              <div className={cx("badge")}>Selected</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
