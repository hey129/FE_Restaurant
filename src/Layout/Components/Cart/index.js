// src/Pages/Cart/Cart.jsx
import React, { useMemo } from "react";
import classNames from "classnames/bind";
import { useNavigate } from "react-router-dom";
import styles from "./Cart.module.scss";
import Return from "../Button/Return";
import { useCart, useAuth } from "~/Api";
import Button from "../Button";

const cx = classNames.bind(styles);

function Cart() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { items, updateQuantity, removeFromCart, subtotal } = useCart();

  const vnd = (n) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(Math.round(Number(n) || 0));

  const totalPrice = useMemo(() => subtotal, [subtotal]);

  const handleQuantityChange = (id, delta) => {
    const current = items.find((x) => x.id === id)?.quantity || 1;
    updateQuantity(id, current + delta);
  };

  const handlePlaceOrder = () => {
    if (items.length === 0) {
      return; // Don't navigate if cart is empty
    }
    navigate("/createorder");
  };

  if (!isAuthenticated) {
    return (
      <div className={cx("page-container")}>
        <div className={cx("cart-layout")}>
          <div className={cx("cart-items")}>
            <h1 className={cx("title")}>Bạn chưa đăng nhập</h1>
            <p>Vui lòng đăng nhập để xem giỏ hàng của bạn.</p>
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
            <p className={cx("empty")}>Giỏ hàng đang trống.</p>
          )}

          {items.map((item) => (
            <div key={item.id} className={cx("cart-item")}>
              <img
                src={item.image}
                alt={item.name}
                className={cx("item-image")}
              />
              <div className={cx("item-details")}>
                <span className={cx("item-name")}>{item.name}</span>
              </div>
              <div className={cx("quantity-stepper")}>
                <button onClick={() => handleQuantityChange(item.id, -1)}>
                  -
                </button>
                <input type="text" value={item.quantity} readOnly />
                <button onClick={() => handleQuantityChange(item.id, 1)}>
                  +
                </button>
              </div>
              <span className={cx("item-price")}>
                {vnd(item.price * item.quantity)}
              </span>
              <button
                onClick={() => removeFromCart(item.id)}
                className={cx("remove-btn")}
              >
                ×
              </button>
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
                disabled={items.length === 0}
              >
                Place Order
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
