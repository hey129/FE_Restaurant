import CryptoJS from 'crypto-js';
import { Platform } from 'react-native';

const MOMO_CONFIG = {
  SANDBOX_ENDPOINT: 'https://test-payment.momo.vn/v2/gateway/api/create',
  ACCESS_KEY: 'F8BBA842ECF85',
  SECRET_KEY: 'K951B6PE1waDMi640xX08PD3vg6EkVlz',
  PARTNER_CODE: 'MOMO',
  REDIRECT_URL: 'https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b',
  IPN_URL: 'https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b',
  PARTNER_NAME: 'FoodFast',
  STORE_ID: 'FoodFastStore',
} as const;

export interface MoMoPaymentRequest {
  totalAmount: number;
  itemCount: number;
}

export interface MoMoPaymentResponse {
  success: boolean;
  transactionId: string;
  payUrl: string;
}

const generateOrderId = (): string => {
  return `${MOMO_CONFIG.PARTNER_CODE}${Date.now()}`;
};

const convertToFullVND = (shortAmount: number): number => {
  return Math.round(shortAmount * 1000);
};

const createSignature = (rawSignature: string): string => {
  return CryptoJS.HmacSHA256(rawSignature, MOMO_CONFIG.SECRET_KEY).toString();
};

const buildRawSignature = (params: {
  accessKey: string;
  amount: string;
  extraData: string;
  ipnUrl: string;
  orderId: string;
  orderInfo: string;
  partnerCode: string;
  redirectUrl: string;
  requestId: string;
  requestType: string;
}): string => {
  return (
    `accessKey=${params.accessKey}` +
    `&amount=${params.amount}` +
    `&extraData=${params.extraData}` +
    `&ipnUrl=${params.ipnUrl}` +
    `&orderId=${params.orderId}` +
    `&orderInfo=${params.orderInfo}` +
    `&partnerCode=${params.partnerCode}` +
    `&redirectUrl=${params.redirectUrl}` +
    `&requestId=${params.requestId}` +
    `&requestType=${params.requestType}`
  );
};

const buildRequestBody = (
  orderId: string,
  amount: string,
  orderInfo: string,
  signature: string
) => {
  return {
    partnerCode: MOMO_CONFIG.PARTNER_CODE,
    partnerName: MOMO_CONFIG.PARTNER_NAME,
    storeId: MOMO_CONFIG.STORE_ID,
    requestId: orderId,
    amount,
    orderId,
    orderInfo,
    redirectUrl: MOMO_CONFIG.REDIRECT_URL,
    ipnUrl: MOMO_CONFIG.IPN_URL,
    lang: 'vi',
    requestType: 'payWithMethod',
    autoCapture: true,
    extraData: '',
    orderGroupId: '',
    signature,
  };
};

export async function processMoMoPayment(
  request: MoMoPaymentRequest
): Promise<MoMoPaymentResponse> {
  try {
    console.log('[MoMo] Bắt đầu thanh toán...');

    const orderId = generateOrderId();
    const amountVND = convertToFullVND(request.totalAmount);
    const orderInfo = `Thanh toán đơn hàng FoodFast - ${request.itemCount} món`;

    const rawSignature = buildRawSignature({
      accessKey: MOMO_CONFIG.ACCESS_KEY,
      amount: amountVND.toString(),
      extraData: '',
      ipnUrl: MOMO_CONFIG.IPN_URL,
      orderId,
      orderInfo,
      partnerCode: MOMO_CONFIG.PARTNER_CODE,
      redirectUrl: MOMO_CONFIG.REDIRECT_URL,
      requestId: orderId,
      requestType: 'payWithMethod',
    });

    const signature = createSignature(rawSignature);

    const requestBody = buildRequestBody(
      orderId,
      amountVND.toString(),
      orderInfo,
      signature
    );

    console.log('[MoMo] Request:', {
      orderId,
      amount: `${request.totalAmount} (${amountVND} VND)`,
      platform: Platform.OS,
    });

    const response = await fetch(MOMO_CONFIG.SANDBOX_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();
    console.log('[MoMo] Response:', result);

    if (result.resultCode === 0 && result.payUrl) {
      console.log('[MoMo] Thanh toán thành công!');
      return {
        success: true,
        transactionId: orderId,
        payUrl: result.payUrl,
      };
    } else {
      throw new Error(result.message || 'Giao dịch thất bại');
    }
  } catch (error) {
    console.error('[MoMo] Lỗi:', error);
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Không thể kết nối đến MoMo. Vui lòng thử lại!'
    );
  }
}

export function getFullVNDAmount(shortAmount: number): number {
  return convertToFullVND(shortAmount);
}

export function formatVND(amount: number, isShortFormat: boolean = false): string {
  const fullAmount = isShortFormat ? convertToFullVND(amount) : amount;
  return fullAmount.toLocaleString('vi-VN') + ' VNĐ';
}
