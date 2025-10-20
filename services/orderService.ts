import { supabase } from './supabaseClient';

export interface OrderData {
  customer_id?: string;
  delivery_address: string;
  total_amount: number;
  order_status?: string;
  payment_status?: string;
  note?: string;
}

export interface OrderDetailData {
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
}

export interface PaymentData {
  order_id: number;
  amount: number;
  method: string;
  transaction_id: string;
  note?: string;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface SaveOrderResult {
  success: boolean;
  orderId?: number;
  message?: string;
  error?: string;
}


async function insertOrder(orderData: OrderData) {
  console.log('[Order] Insert order với customer_id:', orderData.customer_id);
  
  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      customer_id: orderData.customer_id || null,
      delivery_address: orderData.delivery_address,
      total_amount: orderData.total_amount,
      order_status: orderData.order_status || 'Chờ xử lý',
      payment_status: orderData.payment_status || 'Đã thanh toán',
      note: orderData.note || null,
      order_date: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('[Order] Lỗi khi tạo order:', error);
    throw new Error('Không thể tạo đơn hàng: ' + error.message);
  }

  console.log('[Order] Đã tạo order:', order.order_id);
  console.log('[Order] Order customer_id:', order.customer_id);
  return order;
}


async function insertOrderDetails(orderId: number, cartItems: CartItem[]) {
  const orderDetails = cartItems.map(item => ({
    order_id: orderId,
    product_id: item.id,
    quantity: item.quantity,
    price: item.price
  }));

  const { error } = await supabase
    .from('order_detail')
    .insert(orderDetails);

  if (error) {
    console.error('[Order] Lỗi khi tạo order_detail:', error);
    throw new Error('Không thể lưu chi tiết đơn hàng: ' + error.message);
  }

  console.log('[Order] Đã tạo order_detail:', orderDetails.length, 'items');
}


async function insertPayment(orderId: number, paymentData: Omit<PaymentData, 'order_id'>) {
  const { error } = await supabase
    .from('payment')
    .insert({
      order_id: orderId,
      amount: paymentData.amount,
      method: paymentData.method,
      transaction_id: paymentData.transaction_id,
      note: paymentData.note || null,
      payment_date: new Date().toISOString()
    });

  if (error) {
    console.error('[Order] Lỗi khi tạo payment:', error);
    throw new Error('Không thể lưu thông tin thanh toán: ' + error.message);
  }

  console.log('[Order] Đã tạo payment:', paymentData.transaction_id);
}


async function clearCartFromDatabase(customerId?: string) {
  if (!customerId) return;

  const { error } = await supabase
    .from('cart')
    .delete()
    .eq('customer_id', customerId)
    .eq('status', 'active');

  if (error) {
    console.warn('[Order] Không thể xóa cart:', error.message);
  } else {
    console.log('[Order] Đã xóa cart trong database');
  }
}


export async function saveOrderToDatabase(
  orderData: OrderData,
  cartItems: CartItem[],
  paymentData: Omit<PaymentData, 'order_id'>
): Promise<SaveOrderResult> {
  try {
    console.log('[Order] Bắt đầu lưu đơn hàng...');

    const order = await insertOrder(orderData);
    const orderId = order.order_id;

    await insertOrderDetails(orderId, cartItems);

    await insertPayment(orderId, paymentData);

    await clearCartFromDatabase(orderData.customer_id);

    console.log('[Order] Lưu đơn hàng thành công! Order ID:', orderId);

    return {
      success: true,
      orderId,
      message: 'Đơn hàng đã được lưu thành công!'
    };

  } catch (error) {
    console.error('[Order] Lỗi khi lưu đơn hàng:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi không xác định'
    };
  }
}


export async function getCurrentCustomer() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }

    const { data: customer, error } = await supabase
      .from('customer')
      .select('*')
      .eq('customer_id', user.id)
      .single();

    if (error) {
      console.error('Lỗi khi lấy thông tin customer:', error);
      return null;
    }

    return customer;
  } catch (error) {
    console.error('Lỗi:', error);
    return null;
  }
}


export async function getCustomerOrders(customerId: string) {
  try {
    console.log('[Order] Đang lấy đơn hàng cho customer_id:', customerId);
    
    //  Test query chỉ lấy orders
    const { data: ordersOnly, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', customerId);
    
    console.log('[Order] Test query orders only:', ordersOnly);
    console.log('[Order] Orders error:', ordersError);
    
    //  Query đầy đủ với join
    const { data, error } = await supabase
      .from('orders')
      .select(`
        order_id,
        order_date,
        total_amount,
        order_status,
        delivery_address,
        order_detail (
          quantity,
          price,
          product (
            product_name
          )
        )
      `)
      .eq('customer_id', customerId)
      .order('order_date', { ascending: false });

    if (error) {
      console.error('[Order] Lỗi khi query đơn hàng:', error);
      console.error('[Order] Error details:', JSON.stringify(error));
      throw error;
    }

    console.log('[Order] Raw data từ Supabase:', data);
    console.log('[Order] Số lượng orders:', data?.length || 0);

    const formattedOrders = (data || []).map((order: any) => ({
      order_id: order.order_id,
      created_at: order.order_date, 
      total_amount: order.total_amount,
      order_status: order.order_status,
      delivery_address: order.delivery_address,
      items: (order.order_detail || []).map((detail: any) => ({
        product_name: detail.product?.product_name || 'Unknown',
        quantity: detail.quantity,
        price: detail.price,
      }))
    }));

    console.log('[Order] Đã lấy được', formattedOrders.length, 'đơn hàng');
    if (formattedOrders.length > 0) {
      console.log('[Order] Đơn hàng đầu tiên:', formattedOrders[0]);
    }
    
    return formattedOrders;
  } catch (error) {
    console.error('[Order] Lỗi khi lấy đơn hàng:', error);
    return [];
  }
}
