import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

export default function PaymentReturn() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Checking payment result...");

  useEffect(() => {
    const resultCode = searchParams.get("resultCode");
    const orderId = searchParams.get("orderId");
    const transId = searchParams.get("transId");
    const momoMessage = searchParams.get("message");

    console.log("📨 Payment Return:", {
      resultCode,
      orderId,
      transId,
      message: momoMessage,
    });

    if (resultCode === "0") {
      // Payment successful
      setStatus("success");
      setMessage("✅ Payment successful!");
      toast.success("Payment successful!");

      // Redirect to success page after 2 seconds
      setTimeout(() => {
        navigate(
          `/payment/success?orderId=${orderId}&transId=${transId}&method=momo`
        );
      }, 2000);
    } else if (resultCode === "1006") {
      // User cancelled payment
      setStatus("cancelled");
      setMessage("❌ You cancelled the payment");
      toast.error("Payment was cancelled");

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } else if (resultCode) {
      // Payment failed
      setStatus("failed");
      setMessage(
        `❌ Payment failed: ${momoMessage || `Error code ${resultCode}`}`
      );
      toast.error(
        `Payment failed: ${momoMessage || `Error code ${resultCode}`}`
      );

      setTimeout(() => {
        navigate("/");
      }, 3000);
    } else {
      // No result code
      setStatus("unknown");
      setMessage("⚠️ No payment result received");
    }
  }, [searchParams, navigate]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <Toaster position="top-right" />

      {status === "loading" && (
        <div>
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>⏳</div>
          <h2>{message}</h2>
        </div>
      )}

      {status === "success" && (
        <div>
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>✅</div>
          <h2 style={{ color: "#28a745" }}>{message}</h2>
          <p>Redirecting to confirmation page...</p>
        </div>
      )}

      {status === "cancelled" && (
        <div>
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>❌</div>
          <h2 style={{ color: "#ffc107" }}>{message}</h2>
          <p>Returning to cart...</p>
        </div>
      )}

      {status === "failed" && (
        <div>
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>❌</div>
          <h2 style={{ color: "#dc3545" }}>{message}</h2>
          <p>Returning to cart...</p>
        </div>
      )}

      {status === "unknown" && (
        <div>
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>⚠️</div>
          <h2 style={{ color: "#6c757d" }}>{message}</h2>
          <button
            onClick={() => navigate("/")}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Quay về giỏ hàng
          </button>
        </div>
      )}
    </div>
  );
}
