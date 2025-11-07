// src/Api/orders.js
import { supabase } from "./supabase";

/**
 * Tạo đơn hàng từ giỏ hàng hiện tại.
 * @param {Object} params
 * @param {string} params.customerId - UUID người dùng (auth.users.id / customer.customer_id)
 * @param {Array<{id:number, quantity:number, price:number}>} params.items - các item trong cart
 * @param {number} params.shipping - phí ship (VND)
 * @param {string} [params.deliveryAddress] - địa chỉ giao (có thể khác profile)
 * @param {string} [params.note] - ghi chú
 * @param {string} [params.paymentMethod] - phương thức thanh toán ("cod", "bank", ...)
 * @returns {Promise<{orderId:number}>}
 */
export async function createOrder({
  customerId,
  items,
  shipping,
  deliveryAddress,
  note,
  paymentMethod = "momo", // Default to COD
}) {
  if (!customerId) throw new Error("NO_CUSTOMER");
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
      delivery_address: deliveryAddress || null,
      total_amount: total,
      order_status: "Chờ xử lý",
      payment_status: "Đã thanh toán",
      note: note || null,
    })
    .select("order_id")
    .single();

  console.log(
    customerId,
    items,
    shipping,
    deliveryAddress,
    note,
    paymentMethod
  );

  if (orderErr) throw orderErr;
  const orderId = orderRow.order_id;

  // 2) insert order_detail (bulk)
  const details = items.map((it) => ({
    order_id: orderId,
    product_id: it.id,
    quantity: it.quantity,
    price: it.price, // snapshot giá
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
        ? "Chờ thanh toán MoMo"
        : "Khởi tạo thanh toán",
  });

  if (payErr) {
    console.error("⚠️ Payment record creation failed:", payErr);
    // Don't throw error here, order is already created
  }

  // 4) Đánh dấu cart của user là 'ordered' (soft clear)
  await supabase
    .from("cart")
    .update({ status: "ordered" })
    .eq("customer_id", customerId)
    .eq("status", "active");

  return { orderId };
}

/**
 * Get orders for a customer by status
 * @param {Object} params
 * @param {string} params.customerId - Customer UUID
 * @param {string[]} params.statuses - Array of order statuses to filter (e.g., ["pending", "processing"])
 * @returns {Promise<Array>}
 */
export async function getOrders({ customerId, statuses }) {
  if (!customerId) throw new Error("NO_CUSTOMER");

  let query = supabase
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
    .eq("customer_id", customerId)
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
  };

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
    orderStatus: "Hủy",
    paymentStatus: "Hoàn tiền", // ✅ Always set to Refund when cancelling
  });
}

/**
 * Complete order
 * @param {Object} params
 * @param {number} params.orderId - Order ID
 * @returns {Promise<Object>}
 */
export async function completeOrder({ orderId }) {
  return updateOrderStatus({
    orderId,
    orderStatus: "Hoàn thành",
    paymentStatus: "Đã thanh toán",
  });
}

/**
 * Get all orders with customer info (Admin/Restaurant view)
 * @param {Object} params
 * @param {string} [params.status] - Optional status filter ('all' for no filter)
 * @returns {Promise<Array>}
 */
export async function getAllOrders({ status = "all" } = {}) {
  let query = supabase
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
      customer:customer_id (
        customer_name,
        phone
      ),
      payment:payment!payment_order_id_fkey(method, transaction_id)
    `
    )
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
 * Get payment details for an order
 * @param {Object} params
 * @param {number} params.orderId - Order ID
 * @returns {Promise<Object>}
 */
export async function getOrderPayment({ orderId }) {
  if (!orderId) throw new Error("NO_ORDER_ID");

  const { data, error } = await supabase
    .from("payment")
    .select("*")
    .eq("order_id", orderId)
    .order("payment_date", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows returned
    throw error;
  }

  return data || null;
}

/**
 * Update payment status
 * @param {Object} params
 * @param {number} params.orderId - Order ID
 * @param {string} params.paymentStatus - New payment status
 * @returns {Promise<Object>}
 */
export async function updatePaymentStatus({ orderId, paymentStatus }) {
  if (!orderId) throw new Error("NO_ORDER_ID");
  if (!paymentStatus) throw new Error("NO_PAYMENT_STATUS");

  const { data, error } = await supabase
    .from("orders")
    .update({ payment_status: paymentStatus })
    .eq("order_id", orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
