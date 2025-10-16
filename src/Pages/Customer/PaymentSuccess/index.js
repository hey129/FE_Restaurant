import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import classNames from "classnames/bind";
import styles from "./PaymentSuccess.module.scss";
import toast, { Toaster } from "react-hot-toast";

const cx = classNames.bind(styles);

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("checking"); // checking, success, failed
  const [orderInfo, setOrderInfo] = useState(null);

  useEffect(() => {
    const checkPayment = async () => {
      // Get params from MoMo redirect
      const orderId = searchParams.get("orderId");
      const amount = searchParams.get("amount");
      const transId = searchParams.get("transId");
      const resultCode = searchParams.get("resultCode");
      const message = searchParams.get("message");

      console.log("📥 Payment callback received:", {
        orderId,
        resultCode,
        message,
      });

      if (!orderId || !resultCode) {
        setStatus("failed");
        toast.error("Thông tin thanh toán không hợp lệ");
        return;
      }

      // Check payment result
      if (resultCode === "0") {
        // Success
        setStatus("success");
        setOrderInfo({
          orderId,
          transId,
          amount,
          message,
        });
        toast.success("Thanh toán thành công!");

        // Redirect to order list after 3 seconds
        setTimeout(() => {
          navigate("/profile/onprocessorder");
        }, 3000);
      } else {
        // Failed or cancelled
        setStatus("failed");
        toast.error(message || "Thanh toán thất bại");

        // Redirect to cart after 3 seconds
        setTimeout(() => {
          navigate("/cart");
        }, 3000);
      }
    };

    checkPayment();
  }, [searchParams, navigate]);

  const formatVND = (n) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(Math.round(Number(n) || 0));

  return (
    <section className={cx("section")}>
      <Toaster position="top-right" />
      <div className={cx("container")}>
        <div className={cx("card")}>
          {status === "checking" && (
            <div className={cx("status", "checking")}>
              <div className={cx("spinner")}></div>
              <h2>Đang kiểm tra thanh toán...</h2>
              <p>Vui lòng chờ trong giây lát</p>
            </div>
          )}

          {status === "success" && orderInfo && (
            <div className={cx("status", "success")}>
              <div className={cx("icon", "success-icon")}>✓</div>
              <h2>Thanh toán thành công!</h2>
              <p className={cx("message")}>{orderInfo.message}</p>
              <div className={cx("details")}>
                <div className={cx("detail-row")}>
                  <span>Mã đơn hàng:</span>
                  <strong>#{orderInfo.orderId}</strong>
                </div>
                <div className={cx("detail-row")}>
                  <span>Mã giao dịch:</span>
                  <strong>{orderInfo.transId}</strong>
                </div>
                <div className={cx("detail-row")}>
                  <span>Số tiền:</span>
                  <strong>{formatVND(orderInfo.amount)}</strong>
                </div>
              </div>
              <p className={cx("redirect")}>
                Đang chuyển đến trang đơn hàng...
              </p>
              <button
                className={cx("btn")}
                onClick={() => navigate("/profile/onprocessorder")}
              >
                Xem đơn hàng ngay
              </button>
            </div>
          )}

          {status === "failed" && (
            <div className={cx("status", "failed")}>
              <div className={cx("icon", "failed-icon")}>✕</div>
              <h2>Thanh toán thất bại</h2>
              <p className={cx("message")}>
                Giao dịch không thành công hoặc đã bị hủy
              </p>
              <p className={cx("redirect")}>Đang quay về giỏ hàng...</p>
              <button className={cx("btn")} onClick={() => navigate("/cart")}>
                Quay về giỏ hàng
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
