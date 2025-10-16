import express from "express";
import cors from "cors";
import crypto from "crypto";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MoMo Configuration
const MOMO_CONFIG = {
  partnerCode: process.env.MOMO_PARTNER_CODE,
  accessKey: process.env.MOMO_ACCESS_KEY,
  secretKey: process.env.MOMO_SECRET_KEY,
  endpoint: process.env.MOMO_ENDPOINT,
  redirectUrl: `${process.env.CLIENT_URL}/payment/success`,
  ipnUrl: `${
    process.env.SERVER_URL || "http://localhost:5000"
  }/api/momo/callback`,
};

// Generate MoMo signature
function generateSignature(rawSignature, secretKey) {
  return crypto
    .createHmac("sha256", secretKey)
    .update(rawSignature)
    .digest("hex");
}

// Create MoMo payment
app.post("/api/momo/create-payment", async (req, res) => {
  try {
    const { orderId, amount, orderInfo, extraData = "" } = req.body;

    if (!orderId || !amount || !orderInfo) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: orderId, amount, orderInfo",
      });
    }

    const requestId = orderId;
    const requestType = "captureWallet";
    const lang = "vi";

    // Build raw signature
    const rawSignature = [
      `accessKey=${MOMO_CONFIG.accessKey}`,
      `amount=${amount}`,
      `extraData=${extraData}`,
      `ipnUrl=${MOMO_CONFIG.ipnUrl}`,
      `orderId=${orderId}`,
      `orderInfo=${orderInfo}`,
      `partnerCode=${MOMO_CONFIG.partnerCode}`,
      `redirectUrl=${MOMO_CONFIG.redirectUrl}`,
      `requestId=${requestId}`,
      `requestType=${requestType}`,
    ].join("&");

    const signature = generateSignature(rawSignature, MOMO_CONFIG.secretKey);

    // Request body to MoMo
    const requestBody = {
      partnerCode: MOMO_CONFIG.partnerCode,
      partnerName: "Restaurant",
      storeId: "RestaurantStore",
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl: MOMO_CONFIG.redirectUrl,
      ipnUrl: MOMO_CONFIG.ipnUrl,
      lang,
      requestType,
      extraData,
      signature,
    };

    console.log("🚀 Sending payment request to MoMo:", {
      orderId,
      amount,
      orderInfo,
    });

    // Send request to MoMo
    const response = await fetch(MOMO_CONFIG.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const momoResponse = await response.json();

    console.log("📥 MoMo response:", {
      resultCode: momoResponse.resultCode,
      message: momoResponse.message,
    });

    if (momoResponse.resultCode === 0) {
      // Success - return payment URL
      res.json({
        success: true,
        payUrl: momoResponse.payUrl,
        orderId: momoResponse.orderId,
        requestId: momoResponse.requestId,
      });
    } else {
      // MoMo error
      res.status(400).json({
        success: false,
        message: momoResponse.message || "MoMo payment failed",
        resultCode: momoResponse.resultCode,
      });
    }
  } catch (error) {
    console.error("❌ Create payment error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// MoMo IPN (Instant Payment Notification) callback
app.post("/api/momo/callback", async (req, res) => {
  try {
    console.log("📞 Received MoMo callback:", req.body);

    const {
      partnerCode,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature,
    } = req.body;

    // Verify signature
    const rawSignature = [
      `accessKey=${MOMO_CONFIG.accessKey}`,
      `amount=${amount}`,
      `extraData=${extraData}`,
      `message=${message}`,
      `orderId=${orderId}`,
      `orderInfo=${orderInfo}`,
      `orderType=${orderType}`,
      `partnerCode=${partnerCode}`,
      `payType=${payType}`,
      `requestId=${requestId}`,
      `responseTime=${responseTime}`,
      `resultCode=${resultCode}`,
      `transId=${transId}`,
    ].join("&");

    const expectedSignature = generateSignature(
      rawSignature,
      MOMO_CONFIG.secretKey
    );

    if (signature !== expectedSignature) {
      console.error("⚠️ Invalid signature from MoMo");
      return res.status(403).json({
        success: false,
        message: "Invalid signature",
      });
    }

    // Update order status in database
    if (resultCode === 0) {
      // Payment successful
      const { error } = await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          transaction_id: transId,
          status: "processing",
        })
        .eq("order_id", orderId);

      if (error) {
        console.error("❌ Failed to update order:", error);
      } else {
        console.log("✅ Order payment confirmed:", orderId);
      }
    } else {
      // Payment failed or cancelled
      const { error } = await supabase
        .from("orders")
        .update({
          payment_status: "failed",
          status: "cancelled",
        })
        .eq("order_id", orderId);

      if (error) {
        console.error("❌ Failed to update order:", error);
      } else {
        console.log("⚠️ Order payment failed:", orderId);
      }
    }

    // Always return 200 to MoMo
    res.status(200).json({
      success: true,
      message: "Callback received",
    });
  } catch (error) {
    console.error("❌ Callback error:", error);
    res.status(200).json({
      success: true,
      message: "Callback received with error",
    });
  }
});

// Check payment status
app.get("/api/momo/check-status/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    // Query order from database
    const { data, error } = await supabase
      .from("orders")
      .select("order_id, payment_status, transaction_id, status")
      .eq("order_id", orderId)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      order: data,
    });
  } catch (error) {
    console.error("❌ Check status error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Payment server running on http://localhost:${PORT}`);
  console.log(`📱 MoMo integration ready`);
  console.log(`🔗 Client URL: ${process.env.CLIENT_URL}`);
});
