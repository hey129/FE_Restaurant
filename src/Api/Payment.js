// Payment API Service
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

/**
 * Create MoMo payment
 * @param {Object} params
 * @param {number} params.orderId - Order ID
 * @param {number} params.amount - Payment amount
 * @param {string} params.orderInfo - Order description
 * @returns {Promise<Object>} MoMo payment response with payUrl
 */
export async function createMomoPayment({ orderId, amount, orderInfo }) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/momo/create-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId,
        amount,
        orderInfo: orderInfo || `Thanh toán đơn hàng #${orderId}`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to create payment");
    }

    return data;
  } catch (error) {
    console.error("❌ Create MoMo payment error:", error);
    throw error;
  }
}

/**
 * Query MoMo payment status
 * @param {Object} params
 * @param {number} params.orderId - Order ID
 * @param {string} params.requestId - MoMo request ID
 * @returns {Promise<Object>} Payment status
 */
export async function queryMomoPaymentStatus({ orderId, requestId }) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/momo/query-status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId,
        requestId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to query payment status");
    }

    return data;
  } catch (error) {
    console.error("❌ Query payment status error:", error);
    throw error;
  }
}

/**
 * Get payment details from database
 * @param {number} orderId - Order ID
 * @returns {Promise<Object>} Payment details
 */
export async function getPaymentByOrderId(orderId) {
  // This would typically call your Supabase or backend API
  // For now, we'll leave this as a placeholder
  // You can implement this based on your needs
  return null;
}
