-- Add payment fields to orders table
-- Run this SQL in your Supabase SQL Editor

-- Add columns for payment tracking
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) DEFAULT 'cod';

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_transaction_id ON orders(transaction_id);

-- Update existing orders to have payment_status
UPDATE orders 
SET payment_status = 'paid' 
WHERE payment_status IS NULL AND status NOT IN ('cancelled', 'pending');

-- Comment on columns
COMMENT ON COLUMN orders.payment_status IS 'Payment status: pending, paid, failed';
COMMENT ON COLUMN orders.transaction_id IS 'MoMo transaction ID';
COMMENT ON COLUMN orders.payment_method IS 'Payment method: momo, cod';
