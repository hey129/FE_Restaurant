// src/Api/orders.js
import { supabase } from "./supabase";

/**
 * Create order from current cart.
 * @param {Object} params
 * @param {string} params.customerId - User UUID (auth.users.id / customer.customer_id)
 * @param {string} params.merchantId - Required: Merchant ID for the order
 * @param {Array<{id:number, quantity:number, price:number}>} params.items - cart items
 * @param {number} params.shipping - shipping fee (VND)
 * @param {string} [params.deliveryAddress] - delivery address (can be different from profile)
 * @param {string} [params.note] - order note
 * @param {string} [params.paymentMethod] - payment method ("momo", "bank", ...)
 * @returns {Promise<{orderId:number}>}
 */
export async function createOrder({
  customerId,
  merchantId,
  items,
  shipping,
  deliveryAddress,
  note,
  paymentMethod = "momo",
}) {
  if (!customerId) throw new Error("NO_CUSTOMER");
  if (!merchantId) throw new Error("NO_MERCHANT_ID");
  if (!items?.length) throw new Error("EMPTY_CART");

  const itemsTotal = items.reduce(
    (s, it) => s + Number(it.price || 0) * Number(it.quantity || 0),
    0
  );
  const total = itemsTotal + Number(shipping || 0);

  // 1) insert orders
  const { data: orderRow, error: orderErr } = await supabase
    .from("orders")
    .insert({
      customer_id: customerId,
      merchant_id: merchantId,
      delivery_address: deliveryAddress || null,
      total_amount: total,
      order_status: "Pending",
      payment_status: "Paid",
      note: note || null,
      delivery_updated_at: new Date().toISOString(),
    })
    .select("order_id")
    .single();

  if (orderErr) throw orderErr;
  const orderId = orderRow.order_id;

  // 2) insert order_detail (bulk)
  const details = items.map((it) => ({
    order_id: orderId,
    product_id: it.id,
    quantity: it.quantity,
    price: it.price, // price snapshot
  }));

  const { error: detailErr } = await supabase
    .from("order_detail")
    .insert(details);

  if (detailErr) {
    // nếu lỗi, xoá orders vừa tạo để tránh rác
    await supabase.from("orders").delete().eq("order_id", orderId);
    throw detailErr;
  }

  // 3) Create payment record with method (insert only, no upsert)
  const { error: payErr } = await supabase.from("payment").insert({
    order_id: orderId,
    amount: total,
    method: paymentMethod.toLowerCase(), // Store payment method in payment table (lowercase for consistency)
    note:
      paymentMethod.toLowerCase() === "momo"
        ? "Awaiting MoMo payment"
        : "Payment initiated",
  });

  if (payErr) {
    // Don't throw error here, order is already created
  }

  // 4) Đánh dấu cart của user là 'ordered' (soft clear)
  await supabase
    .from("cart")
    .update({ status: "ordered" })
    .eq("customer_id", customerId)
    .eq("merchant_id", merchantId)
    .eq("status", "active");

  return { orderId };
}

/**
 * Get orders for a customer by status
 * @param {Object} params
 * @param {string} params.customerId - Customer UUID
 * @param {string} params.merchantId - Required: Merchant ID to scope orders
 * @param {string[]} params.statuses - Array of order statuses to filter (e.g., ["Pending", "Processing"])
 * @returns {Promise<Array>}
 */
export async function getOrders({ customerId, merchantId, statuses }) {
  if (!customerId) throw new Error("NO_CUSTOMER");
  if (!merchantId) throw new Error("NO_MERCHANT_ID");

  let query = supabase
    .from("orders")
    .select(
      `
      order_id,
      customer_id,
      merchant_id,
      order_date,
      delivery_address,
      total_amount,
      order_status,
      payment_status,
      note,
      payment:payment!payment_order_id_fkey(method, transaction_id)
    `
    )
    .eq("customer_id", customerId)
    .eq("merchant_id", merchantId)
    .order("order_date", { ascending: false });

  if (statuses && statuses.length > 0) {
    query = query.in("order_status", statuses);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

/**
 * Get order detail with products
 * @param {Object} params
 * @param {number} params.orderId - Order ID
 * @returns {Promise<Object>}
 */
export async function getOrderDetail({ orderId }) {
  if (!orderId) throw new Error("NO_ORDER_ID");

  // Get order info
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .select(
      `
      order_id,
      customer_id,
      order_date,
      delivery_address,
      total_amount,
      order_status,
      payment_status,
      note,
      payment:payment!payment_order_id_fkey(method, transaction_id)
    `
    )
    .eq("order_id", orderId)
    .single();

  if (orderErr) throw orderErr;

  // Get order items with product details
  const { data: items, error: itemsErr } = await supabase
    .from("order_detail")
    .select(
      `
      order_detail_id,
      order_id,
      product_id,
      quantity,
      price,
      created_at,
      product:product_id (
        product_id,
        product_name,
        image,
        price,
        category_id
      )
    `
    )
    .eq("order_id", orderId);

  if (itemsErr) throw itemsErr;

  // Format items
  const formattedItems = (items || []).map((item) => ({
    id: item.product_id,
    name: item.product?.product_name || "Product",
    image: item.product?.image || "",
    quantity: item.quantity,
    price: Number(item.price) || 0,
    subtotal: Number(item.price) * Number(item.quantity),
  }));

  return {
    ...order,
    items: formattedItems,
  };
}

/**
 * Update order status
 * @param {Object} params
 * @param {number} params.orderId - Order ID
 * @param {string} params.orderStatus - New order status
 * @param {string} params.paymentStatus - New payment status (optional)
 * @returns {Promise<Object>}
 */
export async function updateOrderStatus({
  orderId,
  orderStatus,
  paymentStatus,
}) {
  if (!orderId) throw new Error("NO_ORDER_ID");
  if (!orderStatus) throw new Error("NO_ORDER_STATUS");

  const updateData = {
    order_status: orderStatus,
    delivery_updated_at: new Date().toISOString(),
  };

  // Set delivery_started_at when status changes to "Shipping"
  if (orderStatus === "Shipping") {
    updateData.delivery_started_at = new Date().toISOString();
  }

  if (paymentStatus) {
    updateData.payment_status = paymentStatus;
  }

  const { data, error } = await supabase
    .from("orders")
    .update(updateData)
    .eq("order_id", orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Cancel order and refund payment
 * @param {Object} params
 * @param {number} params.orderId - Order ID
 * @returns {Promise<Object>}
 */
export async function cancelOrder({ orderId }) {
  return updateOrderStatus({
    orderId,
    orderStatus: "Cancelled",
    paymentStatus: "Refunded", // ✅ Always set to Refund when cancelling
  });
}

/**
 * Get all orders with customer info (Admin/Restaurant view)
 * @param {Object} params
 * @param {string} params.merchantId - Required: Merchant ID to scope orders
 * @param {string} [params.status] - Optional status filter ('all' for no filter)
 * @returns {Promise<Array>}
 */
export async function getAllOrders({ merchantId, status = "all" } = {}) {
  if (!merchantId) throw new Error("NO_MERCHANT_ID");

  let query = supabase
    .from("orders")
    .select(
      `
      order_id,
      customer_id,
      merchant_id,
      order_date,
      delivery_address,
      total_amount,
      order_status,
      payment_status,
      note,
      customer:customer_id (
        customer_name,
        phone
      ),
      payment:payment!payment_order_id_fkey(method, transaction_id)
    `
    )
    .eq("merchant_id", merchantId)
    .order("order_date", { ascending: false });

  // Apply filter if not 'all'
  if (status && status !== "all") {
    query = query.eq("order_status", status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

/**
 * Get all orders from all merchants (for Admin Dashboard)
 * @returns {Promise<Array>} Array of all orders with customer and payment info
 */
export async function getAdminAllOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      order_id,
      customer_id,
      merchant_id,
      order_date,
      delivery_address,
      total_amount,
      order_status,
      payment_status,
      note,
      customer:customer_id (
        customer_name,
        phone
      ),
      payment:payment!payment_order_id_fkey(method, transaction_id)
    `
    )
    .order("order_date", { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get merchant dashboard data - orders with full details
 * @param {Object} params
 * @param {string} params.merchantId - Required: Merchant ID
 * @returns {Promise<Object>} with stats and orders
 */
export async function getMerchantDashboard({ merchantId }) {
  if (!merchantId) throw new Error("NO_MERCHANT_ID");

  try {
    // Get all orders
    const allOrders = await getAllOrders({ merchantId, status: "all" });

    // Calculate stats
    const stats = {
      total: allOrders.length,
      Pending: allOrders.filter((o) => o.order_status === "Pending").length,
      Completed: allOrders.filter((o) => o.order_status === "Completed").length,
      Cancelled: allOrders.filter((o) => o.order_status === "Cancelled").length,
      totalRevenue: allOrders.reduce(
        (sum, o) => sum + Number(o.total_amount || 0),
        0
      ),
    };

    return {
      stats,
      orders: allOrders,
    };
  } catch (err) {
    console.error("getMerchantDashboard error:", err);
    throw err;
  }
}

/**
 * Get order items/details for a specific order
 * @param {Object} params
 * @param {number} params.orderId - Order ID
 * @returns {Promise<Array>}
 */
export async function getOrderItems({ orderId }) {
  if (!orderId) throw new Error("NO_ORDER_ID");

  const { data, error } = await supabase
    .from("order_detail")
    .select(
      `
      order_detail_id,
      product_id,
      quantity,
      price,
      product:product_id (
        product_name,
        image
      )
    `
    )
    .eq("order_id", orderId);

  if (error) throw error;
  return data || [];
}

/**
 * Get all orders across all merchants (for admin view)
 * @returns {Promise<Array>} Array of all orders
 */
export async function getAllOrdersAdmin() {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        order_id,
        customer_id,
        merchant_id,
        order_date,
        delivery_address,
        total_amount,
        order_status,
        payment_status,
        note,
        customer:customer_id (
          customer_name,
          phone
        ),
        payment:payment!payment_order_id_fkey(method, transaction_id)
      `
      )
      .order("order_date", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Get all orders error:", err);
    throw err;
  }
}

/**
 * Auto-fail orders that are in "Shipping" state for more than 1 hour
 * Call this periodically (e.g., every 10 minutes from backend)
 */
export async function autoFailExpiredOrders() {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { data: expiredOrders, error: fetchErr } = await supabase
      .from("orders")
      .select("order_id, delivery_started_at")
      .eq("order_status", "Shipping")
      .lt("delivery_started_at", oneHourAgo);

    if (fetchErr) throw fetchErr;

    if (!expiredOrders || expiredOrders.length === 0) {
      console.log("No expired orders to auto-fail");
      return [];
    }

    // Update expired orders to Failed
    const expiredOrderIds = expiredOrders.map((o) => o.order_id);
    const { data: updatedOrders, error: updateErr } = await supabase
      .from("orders")
      .update({
        order_status: "Failed",
        delivery_updated_at: new Date().toISOString(),
      })
      .in("order_id", expiredOrderIds)
      .select();

    if (updateErr) throw updateErr;

    console.log(`Auto-failed ${updatedOrders.length} expired orders`);
    return updatedOrders;
  } catch (err) {
    console.error("Auto-fail orders error:", err);
    throw err;
  }
}
