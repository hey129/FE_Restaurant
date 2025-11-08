// src/Layout/Components/Customer/PaymentSuccess/index.js
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import classNames from "classnames/bind";
import styles from "./PaymentSuccess.module.scss";
import toast, { Toaster } from "react-hot-toast";

const cx = classNames.bind(styles);

function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("checking"); // checking, success, failed
  const [orderInfo, setOrderInfo] = useState(null);

  useEffect(() => {
    const checkPayment = async () => {
      // Get params from payment redirect
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
        toast.error("Invalid payment information");
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
        toast.success("Payment successful!", { duration: 3000 });

        // Redirect to order list after 3 seconds
        setTimeout(() => {
          navigate("/profile/onprocessorder");
        }, 3000);
      } else {
        // Failed or cancelled
        setStatus("failed");
        toast.error(message || "Payment failed", { duration: 3000 });

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
              <h2>Checking payment...</h2>
              <p>Please wait a moment</p>
            </div>
          )}

          {status === "success" && orderInfo && (
            <div className={cx("status", "success")}>
              <div className={cx("icon", "success-icon")}>✓</div>
              <h2>Payment Successful!</h2>
              <p className={cx("message")}>{orderInfo.message}</p>
              <div className={cx("details")}>
                <div className={cx("detail-row")}>
                  <span>Order ID:</span>
                  <strong>#{orderInfo.orderId}</strong>
                </div>
                <div className={cx("detail-row")}>
                  <span>Transaction ID:</span>
                  <strong>{orderInfo.transId}</strong>
                </div>
                <div className={cx("detail-row")}>
                  <span>Amount:</span>
                  <strong>{formatVND(orderInfo.amount)}</strong>
                </div>
              </div>
              <p className={cx("redirect")}>Redirecting to order page...</p>
              <button
                className={cx("btn")}
                onClick={() => navigate("/profile/onprocessorder")}
              >
                View order now
              </button>
            </div>
          )}

          {status === "failed" && (
            <div className={cx("status", "failed")}>
              <div className={cx("icon", "failed-icon")}>✕</div>
              <h2>Payment Failed</h2>
              <p className={cx("message")}>
                Transaction was unsuccessful or cancelled
              </p>
              <p className={cx("redirect")}>Returning to cart...</p>
              <button className={cx("btn")} onClick={() => navigate("/cart")}>
                Return to cart
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default PaymentSuccess;
