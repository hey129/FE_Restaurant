import { createMomoPayment } from "~/Api/Payment";

export default function MomoPayButton({ orderId, amount, onSuccess, onError }) {
  const handlePayment = async () => {
    try {
      const response = await createMomoPayment({
        orderId,
        amount,
        orderInfo: `Payment for order #${orderId}`,
      });

      if (response?.success && response?.payUrl) {
        // Redirect to MoMo payment page
        window.location.href = response.payUrl;

        if (onSuccess) {
          onSuccess(response);
        }
      } else {
        const errorMsg = response?.message || "Unable to create MoMo payment";
        if (onError) {
          onError(new Error(errorMsg));
        } else {
          alert(errorMsg);
        }
      }
    } catch (error) {
      console.error("MoMo payment error:", error);
      if (onError) {
        onError(error);
      } else {
        alert(error.message || "MoMo payment error");
      }
    }
  };

  return (
    <button
      onClick={handlePayment}
      style={{
        backgroundColor: "#A50064",
        color: "white",
        padding: "10px 20px",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "16px",
        fontWeight: "bold",
      }}
    >
      💳 Pay with MoMo
    </button>
  );
}
