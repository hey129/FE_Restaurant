// src/Pages/Cart/Cart.jsx
import React, { useMemo, useState } from "react";
import classNames from "classnames/bind";
import { useNavigate } from "react-router-dom";
import styles from "./Cart.module.scss";
import Return from "../../Button/Return";
import { useCart, useAuth } from "~/Api";
import Button from "../../Button";

const cx = classNames.bind(styles);

function Cart() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { items, updateQuantity, removeFromCart, subtotal } = useCart();
  const [selectedMerchants, setSelectedMerchants] = useState(new Set());

  const vnd = (n) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(Math.round(Number(n) || 0));

  // Group items by merchant
  const itemsByMerchant = useMemo(() => {
    const grouped = new Map();
    items.forEach((item) => {
      const merchantId = item.merchant_id;
      if (!grouped.has(merchantId)) {
        grouped.set(merchantId, {
          merchant_id: merchantId,
          merchant_name: item.merchant_name,
          items: [],
          subtotal: 0,
        });
      }
      const group = grouped.get(merchantId);
      group.items.push(item);
      group.subtotal += item.price * item.quantity;
    });
    return Array.from(grouped.values());
  }, [items]);

  const totalPrice = useMemo(() => subtotal, [subtotal]);

  const handleQuantityChange = (id, merchantId, delta) => {
    const current =
      items.find((x) => x.id === id && x.merchant_id === merchantId)
        ?.quantity || 1;
    updateQuantity(id, merchantId, current + delta);
  };

  const toggleMerchant = (merchantId) => {
    const newSelected = new Set(selectedMerchants);
    if (newSelected.has(merchantId)) {
      newSelected.delete(merchantId);
    } else {
      newSelected.add(merchantId);
    }
    setSelectedMerchants(newSelected);
  };

  const canCheckout = selectedMerchants.size > 0;

  const handlePlaceOrder = () => {
    if (!canCheckout) {
      return;
    }
    // Navigate with selected merchants
    navigate("/createorder", {
      state: { selectedMerchants: Array.from(selectedMerchants) },
    });
  };

  if (!isAuthenticated) {
    return (
      <div className={cx("page-container")}>
        <div className={cx("cart-layout")}>
          <div className={cx("cart-items")}>
            <h1 className={cx("title")}>You are not logged in</h1>
            <p>Please login to view your cart.</p>
            <Return />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cx("page-container")}>
      <div className={cx("cart-layout")}>
        {/* LEFT: ITEMS */}
        <div className={cx("cart-items")}>
          <div className={cx("header")}>
            <h1 className={cx("title")}>Shopping Cart</h1>
            <span className={cx("item-count")}>{items.length} items</span>
          </div>
          <hr className={cx("divider")} />

          {items.length === 0 && (
            <p className={cx("empty")}>Your cart is empty.</p>
          )}

          {/* Group items by merchant */}
          {itemsByMerchant.map((merchantGroup) => (
            <div
              key={merchantGroup.merchant_id}
              className={cx("merchant-group")}
            >
              <div className={cx("merchant-header")}>
                <input
                  type="checkbox"
                  checked={selectedMerchants.has(merchantGroup.merchant_id)}
                  onChange={() => toggleMerchant(merchantGroup.merchant_id)}
                  className={cx("merchant-checkbox")}
                />
                <h3 className={cx("merchant-name")}>
                  {merchantGroup.merchant_name}
                </h3>
                <span className={cx("merchant-subtotal")}>
                  {vnd(merchantGroup.subtotal)}
                </span>
              </div>

              {merchantGroup.items.map((item) => (
                <div
                  key={`${item.merchant_id}:${item.id}`}
                  className={cx("cart-item")}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className={cx("item-image")}
                  />
                  <div className={cx("item-details")}>
                    <span className={cx("item-name")}>{item.name}</span>
                  </div>
                  <div className={cx("quantity-stepper")}>
                    <button
                      onClick={() =>
                        handleQuantityChange(item.id, item.merchant_id, -1)
                      }
                    >
                      -
                    </button>
                    <input type="text" value={item.quantity} readOnly />
                    <button
                      onClick={() =>
                        handleQuantityChange(item.id, item.merchant_id, 1)
                      }
                    >
                      +
                    </button>
                  </div>
                  <span className={cx("item-price")}>
                    {vnd(item.price * item.quantity)}
                  </span>
                  <button
                    onClick={() => removeFromCart(item.id, item.merchant_id)}
                    className={cx("remove-btn")}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ))}

          <div className={cx("summary-actions")}>
            {/* Phần bên trái: Nút Return */}
            <div className={cx("actions-left")}>
              <Return />
            </div>

            {/* Phần bên phải: Gồm tổng giá và nút Place Order */}
            <div className={cx("actions-right")}>
              <div className={cx("summary-row", "total")}>
                <span>TOTAL PRICE : {vnd(totalPrice.toFixed(2))}</span>
              </div>
              <Button
                className={cx("register-btn")}
                onClick={handlePlaceOrder}
                disabled={!canCheckout}
              >
                Checkout ({selectedMerchants.size}{" "}
                {selectedMerchants.size === 1 ? "store" : "stores"})
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
