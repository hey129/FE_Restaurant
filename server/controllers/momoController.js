// MoMo Payment Controller
import crypto from "crypto";
import https from "https";
import { momoConfig } from "../config/momo.config.js";
import { supabase, isSupabaseConfigured } from "../config/supabase.js";

/**
 * Create HMAC SHA256 signature for MoMo
 */
function createSignature(rawSignature, secretKey) {
  return crypto
    .createHmac("sha256", secretKey)
    .update(rawSignature)
    .digest("hex");
}

/**
 * Send HTTPS request to MoMo endpoint
 */
function sendMomoRequest(requestBody) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "test-payment.momo.vn",
      port: 443,
      path: "/v2/gateway/api/create",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(requestBody),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const jsonResponse = JSON.parse(data);
          resolve(jsonResponse);
        } catch (error) {
          reject(new Error("Failed to parse MoMo response"));
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.write(requestBody);
    req.end();
  });
}

/**
 * Create MoMo payment
 * POST /api/momo/create-payment
 */
export async function createPayment(req, res) {
  try {
    const { orderId, amount, orderInfo, extraData = "" } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: orderId, amount",
      });
    }

    // Generate unique requestId and orderId for MoMo
    // MoMo requires unique orderId for each payment request
    const timestamp = Date.now();
    const requestId = `${momoConfig.partnerCode}${timestamp}`;
    const momoOrderId = `ORDER_${orderId}_${timestamp}`; // Unique order ID for MoMo
    const amountStr = String(amount);
    const orderInfoStr = orderInfo || `Payment for order #${orderId}`;

    // Store original orderId in extraData for later reference
    const extraDataObj = {
      originalOrderId: orderId,
      ...(extraData && typeof extraData === "object" ? extraData : {}),
    };
    const extraDataStr = Buffer.from(JSON.stringify(extraDataObj)).toString(
      "base64"
    );

    // Create raw signature string
    // Format: accessKey=...&amount=...&extraData=...&ipnUrl=...&orderId=...&orderInfo=...&partnerCode=...&redirectUrl=...&requestId=...&requestType=...
    const rawSignature = `accessKey=${momoConfig.accessKey}&amount=${amountStr}&extraData=${extraDataStr}&ipnUrl=${momoConfig.ipnUrl}&orderId=${momoOrderId}&orderInfo=${orderInfoStr}&partnerCode=${momoConfig.partnerCode}&redirectUrl=${momoConfig.redirectUrl}&requestId=${requestId}&requestType=${momoConfig.requestType}`;

    // Generate signature
    const signature = createSignature(rawSignature, momoConfig.secretKey);

    // Create request body
    const requestBody = JSON.stringify({
      partnerCode: momoConfig.partnerCode,
      partnerName: "Restaurant App",
      storeId: "RestaurantStore",
      requestId: requestId,
      amount: amountStr,
      orderId: momoOrderId,
      orderInfo: orderInfoStr,
      redirectUrl: momoConfig.redirectUrl,
      ipnUrl: momoConfig.ipnUrl,
      lang: momoConfig.lang,
      requestType: momoConfig.requestType,
      autoCapture: true,
      extraData: extraDataStr,
      orderGroupId: "",
      signature: signature,
    });

    console.log("🔐 MoMo Request:", {
      originalOrderId: orderId,
      momoOrderId: momoOrderId,
      amount: amountStr,
      requestId,
      signature: signature.substring(0, 20) + "...",
    });

    // Send request to MoMo
    const momoResponse = await sendMomoRequest(requestBody);

    console.log("✅ MoMo Response:", {
      resultCode: momoResponse.resultCode,
      message: momoResponse.message,
      hasPayUrl: !!momoResponse.payUrl,
    });

    // Update payment record in database (payment record should already exist from createOrder)
    if (momoResponse.resultCode === 0 && isSupabaseConfigured && supabase) {
      // Check if payment record exists
      const { data: existingPayment, error: checkError } = await supabase
        .from("payment")
        .select("payment_id")
        .eq("order_id", parseInt(orderId))
        .maybeSingle();

      if (checkError) {
        console.error("❌ Failed to check payment record:", checkError);
      } else if (existingPayment) {
        // Update existing payment record
        const { error: updateError } = await supabase
          .from("payment")
          .update({
            method: "momo",
            transaction_id: requestId, // Store requestId initially, will be updated with transId by IPN
            note: `MoMo payment initiated - ${orderInfoStr} (MoMo Order: ${momoOrderId})`,
          })
          .eq("order_id", parseInt(orderId));

        if (updateError) {
          console.error("❌ Failed to update payment record:", updateError);
        } else {
          console.log(
            "✅ Payment record updated, waiting for MoMo confirmation"
          );
        }
      } else {
        // Insert new payment record if not exists
        const { error: insertError } = await supabase.from("payment").insert({
          order_id: parseInt(orderId),
          amount: parseFloat(amount),
          method: "momo",
          transaction_id: requestId, // Store requestId initially, will be updated with transId by IPN
          note: `MoMo payment initiated - ${orderInfoStr} (MoMo Order: ${momoOrderId})`,
        });

        if (insertError) {
          console.error("❌ Failed to insert payment record:", insertError);
        } else {
          console.log(
            "✅ Payment record created, waiting for MoMo confirmation"
          );
        }
      }
    } else if (!isSupabaseConfigured) {
      console.warn(
        "⚠️  Supabase not configured - payment record not saved to database"
      );
    }

    // Return response
    return res.json({
      success: momoResponse.resultCode === 0,
      ...momoResponse,
    });
  } catch (error) {
    console.error("❌ Create payment error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create MoMo payment",
    });
  }
}

/**
 * Handle MoMo IPN (Instant Payment Notification)
 * POST /api/momo/ipn
 */
export async function handleIPN(req, res) {
  try {
    console.log("📨 MoMo IPN received:", req.body);

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

    // Extract original order ID from extraData
    let originalOrderId = null;
    try {
      if (extraData) {
        const decoded = JSON.parse(Buffer.from(extraData, "base64").toString());
        originalOrderId = decoded.originalOrderId;
      }
    } catch (err) {
      console.warn("⚠️  Could not parse extraData, using orderId as fallback");
    }

    // Use original order ID if available, otherwise try to extract from MoMo orderId
    const dbOrderId =
      originalOrderId || orderId.replace(/^ORDER_(\d+)_.*/, "$1");

    console.log("🔍 Order ID mapping:", {
      momoOrderId: orderId,
      originalOrderId: dbOrderId,
    });

    // Verify signature
    const rawSignature = `accessKey=${momoConfig.accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

    const expectedSignature = createSignature(
      rawSignature,
      momoConfig.secretKey
    );

    if (signature !== expectedSignature) {
      console.error("❌ Invalid signature from MoMo IPN");
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }

    // Update payment and order status
    if (resultCode === 0) {
      // Payment successful
      if (isSupabaseConfigured && supabase) {
        // Update payment table
        const { error: paymentUpdateError } = await supabase
          .from("payment")
          .update({
            transaction_id: requestId,
            payment_date: new Date().toISOString(),
            note: `Payment successful - ${message}`,
          })
          .eq("order_id", parseInt(dbOrderId))
          .eq("method", "momo");

        if (paymentUpdateError) {
          console.error("❌ Failed to update payment:", paymentUpdateError);
        }

        // Update order status
        const { error: orderUpdateError } = await supabase
          .from("orders")
          .update({
            payment_status: "Đã thanh toán",
            order_status: "Đang xử lý",
          })
          .eq("order_id", parseInt(dbOrderId));

        if (orderUpdateError) {
          console.error("❌ Failed to update order:", orderUpdateError);
        }

        console.log("✅ Payment successful for order:", dbOrderId);
      } else {
        console.warn("⚠️  Supabase not configured - order status not updated");
      }
    } else {
      // Payment failed
      if (isSupabaseConfigured && supabase) {
        const { error: orderUpdateError } = await supabase
          .from("orders")
          .update({
            payment_status: "Thất bại",
            order_status: "Đã hủy",
          })
          .eq("order_id", parseInt(dbOrderId));

        if (orderUpdateError) {
          console.error("❌ Failed to update order:", orderUpdateError);
        }

        console.log("❌ Payment failed for order:", dbOrderId, message);
      } else {
        console.warn("⚠️  Supabase not configured - order status not updated");
      }
    }

    // Respond to MoMo (must return 204 No Content)
    return res.status(204).send();
  } catch (error) {
    console.error("❌ IPN handler error:", error);
    return res.status(500).json({
      success: false,
      message: "IPN processing failed",
    });
  }
}

/**
 * Handle MoMo callback (user redirect)
 * GET /api/momo/callback
 */
export async function handleCallback(req, res) {
  try {
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
    } = req.query;

    console.log("🔙 MoMo Callback received:", {
      orderId,
      resultCode,
      message,
    });

    // Redirect to frontend with result
    const redirectUrl = `${
      momoConfig.redirectUrl
    }?orderId=${orderId}&resultCode=${resultCode}&message=${encodeURIComponent(
      message
    )}&transId=${transId}`;

    return res.redirect(redirectUrl);
  } catch (error) {
    console.error("❌ Callback handler error:", error);
    return res.redirect(
      `${momoConfig.redirectUrl}?resultCode=99&message=Error`
    );
  }
}

/**
 * Query payment status from MoMo
 * POST /api/momo/query-status
 */
export async function queryPaymentStatus(req, res) {
  try {
    const { orderId, requestId } = req.body;

    if (!orderId || !requestId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: orderId, requestId",
      });
    }

    // Create signature for query
    const rawSignature = `accessKey=${momoConfig.accessKey}&orderId=${orderId}&partnerCode=${momoConfig.partnerCode}&requestId=${requestId}`;
    const signature = createSignature(rawSignature, momoConfig.secretKey);

    const requestBody = JSON.stringify({
      partnerCode: momoConfig.partnerCode,
      requestId: requestId,
      orderId: String(orderId),
      lang: momoConfig.lang,
      signature: signature,
    });

    // Send query request to MoMo
    const options = {
      hostname: "test-payment.momo.vn",
      port: 443,
      path: "/v2/gateway/api/query",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(requestBody),
      },
    };

    const momoResponse = await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(error);
          }
        });
      });
      req.on("error", reject);
      req.write(requestBody);
      req.end();
    });

    return res.json({
      success: momoResponse.resultCode === 0,
      ...momoResponse,
    });
  } catch (error) {
    console.error("❌ Query status error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to query payment status",
    });
  }
}
