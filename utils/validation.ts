export interface ValidationErrors {
  name: string;
  phone: string;
  address: string;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
}

/**
 * Validate name (not empty)
 */
export function validateName(name: string): string {
  if (!name.trim()) {
    return 'Vui lòng nhập họ và tên';
  }
  return '';
}

/**
 * Validate phone number (10 digits)
 */
export function validatePhone(phone: string): string {
  if (!phone.trim()) {
    return 'Vui lòng nhập số điện thoại';
  }
  
  const cleanPhone = phone.replace(/\s/g, '');
  if (!/^[0-9]{10}$/.test(cleanPhone)) {
    return 'Số điện thoại không hợp lệ (cần 10 số)';
  }
  
  return '';
}

/**
 * Validate address (not empty)
 */
export function validateAddress(address: string): string {
  if (!address.trim()) {
    return 'Vui lòng nhập địa chỉ chi tiết';
  }
  return '';
}

/**
 * Validate complete shipping address
 */
export function validateShippingAddress(
  address: ShippingAddress
): { isValid: boolean; errors: ValidationErrors } {
  const errors: ValidationErrors = {
    name: validateName(address.name),
    phone: validatePhone(address.phone),
    address: validateAddress(address.address),
  };

  const isValid = !errors.name && !errors.phone && !errors.address;

  return { isValid, errors };
}

/**
 * Format phone number for display (optional)
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]}`;
  }
  
  return phone;
}
