import { supabase } from "./supabaseClient";

export interface OrderData {
  customer_id?: string;
  merchant_id: string;
  delivery_address: string;
  total_amount: number;
  order_status?: string;
  payment_status?: string;
  note?: string;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface PaymentData {
  order_id: number;
  amount: number;
  method: string;
  transaction_id: string;
  note?: string;
}

export interface SaveOrderResult {
  success: boolean;
  orderId?: number;
  message?: string;
  error?: string;
}

/* ====================== INSERT ORDER ======================= */
async function insertOrder(orderData: OrderData) {
  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      customer_id: orderData.customer_id || null,
      merchant_id: orderData.merchant_id,
      delivery_address: orderData.delivery_address,
      total_amount: orderData.total_amount,
      order_status: "Pending",
      payment_status: orderData.payment_status || "Paid",
      note: orderData.note || null,
      order_date: new Date().toISOString(),

      delivery_started_at: new Date().toISOString(),
      delivery_updated_at: null,
    })
    .select()
    .single();

  if (error) throw error;
  return order;
}

/* ====================== INSERT ORDER DETAILS ======================= */
async function insertOrderDetails(orderId: number, cartItems: CartItem[]) {
  const details = cartItems.map((item) => ({
    order_id: orderId,
    product_id: item.id,
    quantity: item.quantity,
    price: item.price,
  }));

  const { error } = await supabase.from("order_detail").insert(details);
  if (error) throw error;
}

/* ====================== INSERT PAYMENT ======================= */
async function insertPayment(
  orderId: number,
  paymentData: Omit<PaymentData, "order_id">
) {
  const { error } = await supabase.from("payment").insert({
    order_id: orderId,
    amount: paymentData.amount,
    method: paymentData.method,
    transaction_id: paymentData.transaction_id,
    note: paymentData.note || null,
    payment_date: new Date().toISOString(),
  });

  if (error) throw error;
}

/* ====================== PUBLIC SAVE ORDER ======================= */
export async function saveOrderToDatabase(
  orderData: OrderData,
  cartItems: CartItem[],
  paymentData: Omit<PaymentData, "order_id">
): Promise<SaveOrderResult> {
  try {
    const order = await insertOrder(orderData);
    await insertOrderDetails(order.order_id, cartItems);
    await insertPayment(order.order_id, paymentData);

    return { success: true, orderId: order.order_id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/* ====================== GET CUSTOMER ORDERS ======================= */
export async function getCustomerOrders(customerId: string) {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        order_id,
        order_date,
        merchant_id,
        total_amount,
        order_status,
        payment_status,
        delivery_address,
        delivery_started_at,
        delivery_updated_at,

        merchant:merchant_id (
          merchant_name,
          address
        ),

        order_detail (
          quantity,
          price,
          product (
            product_name
          )
        )
      `
      )
      .eq("customer_id", customerId)
      .order("order_date", { ascending: false });

    if (error) throw error;

    return data.map((order: any) => ({
      order_id: order.order_id,
      created_at: order.order_date,
      merchant_id: order.merchant_id,
      merchant_name: order.merchant?.merchant_name || "Không rõ",
      merchant_address: order.merchant?.address || "Không rõ",
      total_amount: order.total_amount,
      order_status: order.order_status,
      payment_status: order.payment_status,
      delivery_address: order.delivery_address,

      delivery_started_at: order.delivery_started_at,
      delivery_updated_at: order.delivery_updated_at,

      items: order.order_detail?.map((d: any) => ({
        product_name: d.product?.product_name,
        quantity: d.quantity,
        price: d.price,
      })),
    }));
  } catch (error) {
    console.error("[OrderService] ERROR:", error);
    return [];
  }
}

/* ====================== UPDATE DRONE LOCATION ======================= */
/* CHỈ cập nhật thời gian — KHÔNG đổi trạng thái đơn hàng */
export async function updateDroneLocation(orderId: number) {
  try {
    await supabase
      .from("orders")
      .update({
        delivery_updated_at: new Date().toISOString(),
      })
      .eq("order_id", orderId);
  } catch (err) {
    console.log("Error updating drone location:", err);
  }
}

/* ====================== DRONE ARRIVED ======================= */
export async function markOrderArrived(orderId: number) {
  try {
    await supabase
      .from("orders")
      .update({
        delivery_updated_at: new Date().toISOString(),
      })
      .eq("order_id", orderId);
  } catch (err) {
    console.log("Error marking arrived:", err);
  }
}

/* ====================== USER CONFIRM RECEIVED ======================= */
export async function confirmOrderReceived(orderId: number) {
  try {
    await supabase
      .from("orders")
      .update({
        order_status: "Completed",
        payment_status: "Paid",
        delivery_updated_at: new Date().toISOString(),
      })
      .eq("order_id", orderId);
  } catch (err) {
    console.log("Error confirm received:", err);
  }
}
