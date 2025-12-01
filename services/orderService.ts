import {
  getDeliveryCoordinates,
  getMerchantCoordinates
} from "./geocodingService";
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

export interface DroneInfo {
  drone_id: number;
  model: string;
  status: "idle" | "delivering";
  battery: number;
  max_speed: number;
  payload_limit: number;
  current_lat: number | null;
  current_lng: number | null;
  updated_at: string;
}

export interface DeliveryAssignment {
  assignment_id: number;
  order_id: number;
  drone_id: number | null;
  pickup_lat: number;
  pickup_lng: number;
  drop_lat: number;
  drop_lng: number;
  status: "assigned" | "in_transit" | "arrived" | "completed";
  assigned_at: string;
  completed_at: string | null;
  drone?: DroneInfo;
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

/* ====================== ASSIGN DRONE TO ORDER ======================= */
async function assignDroneToOrder(
  orderId: number,
  merchantId: string,
  deliveryAddress: string
) {
  try {
    // 1. Tìm drone idle
    const { data: drone, error: droneError } = await supabase
      .from("drone")
      .select("*")
      .eq("status", "idle")
      .gt("battery", 20)
      .order("battery", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (droneError || !drone) {
      console.log("Không có drone khả dụng, đợi drone idle...");
      return false;
    }

    // 2. Lấy tọa độ merchant từ DB hoặc geocode từ địa chỉ
    const { data: merchant } = await supabase
      .from("merchant")
      .select("latitude, longitude, address")
      .eq("merchant_id", merchantId)
      .single();

    let pickupLat: number;
    let pickupLng: number;

    // Nếu đã có GPS trong DB thì dùng
    if (merchant?.latitude && merchant?.longitude) {
      pickupLat = merchant.latitude;
      pickupLng = merchant.longitude;
      console.log("✅ Dùng GPS có sẵn từ DB merchant");
    } 
    // Nếu chưa có GPS nhưng có địa chỉ → geocode
    else if (merchant?.address) {
      console.log("🔍 Đang geocode địa chỉ merchant:", merchant.address);
      const coords = await getMerchantCoordinates(merchantId, merchant.address);
      pickupLat = coords?.lat || 10.8231;
      pickupLng = coords?.lng || 106.6297;
    } 
    // Không có gì → dùng mặc định
    else {
      pickupLat = 10.8231;
      pickupLng = 106.6297;
      console.warn("⚠️ Merchant không có GPS và địa chỉ, dùng tọa độ mặc định");
    }

    // 3. Geocode địa chỉ giao hàng
    console.log("🔍 Đang geocode địa chỉ giao hàng:", deliveryAddress);
    const deliveryCoords = await getDeliveryCoordinates(deliveryAddress);
    const dropLat = deliveryCoords?.lat || 10.7756;
    const dropLng = deliveryCoords?.lng || 106.7004;

    // 3. Update drone status = delivering và set vị trí ban đầu tại pickup
    await supabase
      .from("drone")
      .update({ 
        status: "delivering",
        current_lat: pickupLat,
        current_lng: pickupLng
      })
      .eq("drone_id", drone.drone_id);

    // 4. Tạo delivery_assignment với GPS thật
    await supabase.from("delivery_assignment").insert({
      order_id: orderId,
      drone_id: drone.drone_id,
      pickup_lat: pickupLat,
      pickup_lng: pickupLng,
      drop_lat: dropLat,
      drop_lng: dropLng,
      status: "assigned",
      assigned_at: new Date().toISOString(),
    });

    console.log(`🚁 Drone #${drone.drone_id} assigned to order #${orderId}`);
    console.log(`   Pickup: (${pickupLat}, ${pickupLng})`);
    console.log(`   Drop: (${dropLat}, ${dropLng})`);

    // 5. Simulate drone di chuyển từ pickup tới drop trong 30s
    const steps = 10; // Update vị trí 10 lần
    const interval = 30000 / steps; // 3s mỗi lần

    for (let i = 1; i <= steps; i++) {
      setTimeout(async () => {
        const progress = i / steps;
        const currentLat = pickupLat + (dropLat - pickupLat) * progress;
        const currentLng = pickupLng + (dropLng - pickupLng) * progress;

        await supabase
          .from("drone")
          .update({ 
            current_lat: currentLat,
            current_lng: currentLng
          })
          .eq("drone_id", drone.drone_id);

        console.log(`🚁 Drone #${drone.drone_id} progress: ${Math.round(progress * 100)}% (${currentLat.toFixed(4)}, ${currentLng.toFixed(4)})`);

        // Nếu đã tới 100% thì update status
        if (i === steps) {
          await simulateDroneArrival(orderId, drone.drone_id, dropLat, dropLng);
        }
      }, interval * i);
    }

    return true;
  } catch (err) {
    console.error("Error assigning drone:", err);
    return false;
  }
}

/* ====================== SIMULATE DRONE ARRIVAL ======================= */
async function simulateDroneArrival(
  orderId: number,
  droneId: number,
  lat: number,
  lng: number
) {
  try {
    // Update vị trí drone
    await supabase
      .from("drone")
      .update({
        current_lat: lat,
        current_lng: lng,
        updated_at: new Date().toISOString(),
      })
      .eq("drone_id", droneId);

    // Update status delivery_assignment = arrived
    await supabase
      .from("delivery_assignment")
      .update({ status: "arrived" })
      .eq("order_id", orderId);

    console.log(`Drone ${droneId} đã tới order ${orderId}`);
  } catch (err) {
    console.error("Error simulating arrival:", err);
  }
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

    // KHÔNG assign drone ngay - chờ admin chuyển order_status = Shipping
    console.log("✅ Đơn hàng đã tạo (Pending), chờ admin xác nhận Shipping để giao hàng");

    return { success: true, orderId: order.order_id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/* ====================== START DELIVERY (ADMIN CALLS) ======================= */
/* Admin chuyển order_status = Shipping → assign drone và bắt đầu giao hàng */
export async function startDelivery(orderId: number) {
  try {
    // 1. Lấy thông tin order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("order_id, merchant_id, delivery_address, order_status")
      .eq("order_id", orderId)
      .single();

    if (orderError || !order) {
      console.error("Không tìm thấy đơn hàng");
      return false;
    }

    // 2. Kiểm tra order phải ở trạng thái Pending hoặc Shipping
    if (order.order_status !== "Pending" && order.order_status !== "Shipping") {
      console.warn(`Order #${orderId} không thể giao (đang ${order.order_status})`);
      return false;
    }

    // 3. Update order_status = Shipping
    await supabase
      .from("orders")
      .update({ order_status: "Shipping" })
      .eq("order_id", orderId);

    console.log(`✅ Order #${orderId} chuyển sang Shipping`);

    // 4. Assign drone và bắt đầu giao hàng
    const assigned = await assignDroneToOrder(
      orderId,
      order.merchant_id,
      order.delivery_address
    );

    if (!assigned) {
      console.error("⚠️ Không thể assign drone");
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error starting delivery:", err);
    return false;
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
        ),

        delivery_assignment (
          assignment_id,
          drone_id,
          pickup_lat,
          pickup_lng,
          drop_lat,
          drop_lng,
          status,
          assigned_at,
          completed_at,
          drone:drone_id (
            drone_id,
            model,
            status,
            battery,
            current_lat,
            current_lng,
            updated_at
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

      // Thông tin delivery assignment và drone
      delivery_assignment: order.delivery_assignment?.[0] || null,

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

/* ====================== GET DELIVERY STATUS ======================= */
export async function getDeliveryStatus(orderId: number) {
  try {
    const { data, error } = await supabase
      .from("delivery_assignment")
      .select(
        `
        *,
        drone:drone_id (
          drone_id,
          model,
          status,
          battery,
          current_lat,
          current_lng,
          updated_at
        )
      `
      )
      .eq("order_id", orderId)
      .order("assigned_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Error getting delivery status:", err);
    return null;
  }
}

/* ====================== UPDATE DRONE LOCATION ======================= */
export async function updateDroneLocation(droneId: number, lat: number, lng: number) {
  try {
    await supabase
      .from("drone")
      .update({
        current_lat: lat,
        current_lng: lng,
        updated_at: new Date().toISOString(),
      })
      .eq("drone_id", droneId);
  } catch (err) {
    console.log("Error updating drone location:", err);
  }
}

/* ====================== DRONE ARRIVED ======================= */
export async function markOrderArrived(orderId: number) {
  try {
    await supabase
      .from("delivery_assignment")
      .update({ status: "arrived" })
      .eq("order_id", orderId);
  } catch (err) {
    console.log("Error marking arrived:", err);
  }
}

/* ====================== USER CONFIRM RECEIVED ======================= */
/* Khi user confirm received -> Complete order + set drone idle */
export async function confirmOrderReceived(orderId: number) {
  try {
    // 1. Lấy thông tin delivery assignment
    const assignment = await getDeliveryStatus(orderId);
    
    if (!assignment?.drone_id) {
      console.error("Không tìm thấy drone cho order này");
      return;
    }

    // 2. Update order status = Completed
    await supabase
      .from("orders")
      .update({
        order_status: "Completed",
        payment_status: "Paid",
      })
      .eq("order_id", orderId);

    // 3. Update delivery_assignment status = completed
    await supabase
      .from("delivery_assignment")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("order_id", orderId);

    // 4. Set drone status = idle
    await supabase
      .from("drone")
      .update({ status: "idle" })
      .eq("drone_id", assignment.drone_id);

    console.log(`Order ${orderId} completed, drone ${assignment.drone_id} is now idle`);
  } catch (err) {
    console.log("Error confirm received:", err);
  }
}

/* ====================== CANCEL ORDER ======================= */
/* Hủy đơn hàng - nếu đang Shipping thì set drone về idle */
export async function cancelOrder(orderId: number) {
  try {
    // 1. Lấy thông tin order hiện tại
    const { data: order } = await supabase
      .from("orders")
      .select("order_status")
      .eq("order_id", orderId)
      .single();

    // 2. Nếu đang Shipping thì lấy drone_id để set về idle
    if (order?.order_status === "Shipping") {
      const assignment = await getDeliveryStatus(orderId);
      
      if (assignment?.drone_id) {
        // Set drone về idle
        await supabase
          .from("drone")
          .update({ status: "idle" })
          .eq("drone_id", assignment.drone_id);

        // Update delivery_assignment status = canceled (nếu cần)
        await supabase
          .from("delivery_assignment")
          .update({ status: "completed", completed_at: new Date().toISOString() })
          .eq("order_id", orderId);

        console.log(`Drone ${assignment.drone_id} returned to idle due to order cancellation`);
      }
    }

    // 3. Update order status = Canceled
    await supabase
      .from("orders")
      .update({ 
        order_status: "Canceled", 
        payment_status: "Refunded" 
      })
      .eq("order_id", orderId);

    console.log(`Order ${orderId} canceled`);
  } catch (err) {
    console.error("Error canceling order:", err);
  }
}
