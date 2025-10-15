// src/Pages/Cart/Cart.jsx
import React, { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import classNames from "classnames/bind";
import styles from "./Cart.module.scss";
import Return from "../Button/Return";
import Button from "../Button";
import { useCart, useAuth } from "~/Api";

const cx = classNames.bind(styles);

function Cart() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { items, updateQuantity, removeFromCart, subtotal } = useCart();
  const [shippingCost, setShippingCost] = useState(5.0);

  const totalPrice = useMemo(
    () => subtotal + shippingCost,
    [subtotal, shippingCost]
  );

  const handleQuantityChange = (id, delta) => {
    const current = items.find((x) => x.id === id)?.quantity || 1;
    updateQuantity(id, current + delta);
  };

  if (!isAuthenticated) {
    const next = location.pathname + location.search + location.hash;
    return (
      <div className={cx("page-container")}>
        <div className={cx("cart-layout")}>
          <div className={cx("cart-items")}>
            <h1 className={cx("title")}>Bạn chưa đăng nhập</h1>
            <p>Vui lòng đăng nhập để xem giỏ hàng của bạn.</p>
            <Button
              className={cx("register-btn")}
              onClick={() =>
                navigate(`/login?next=${encodeURIComponent(next)}`)
              }
            >
              Đăng nhập
            </Button>
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
                € {item.price.toFixed(2)}
              </span>
              <button
                onClick={() => removeFromCart(item.id)}
                className={cx("remove-btn")}
              >
                ×
              </button>
            </div>
          ))}
          <Return />
        </div>

        {/* RIGHT: SUMMARY */}
        <div className={cx("summary")}>
          <h2 className={cx("title")}>Summary</h2>
          <div className={cx("summary-row")}>
            <span>ITEMS {items.length}</span>
            <span>€ {subtotal.toFixed(2)}</span>
          </div>

          <div className={cx("summary-group")}>
            <label htmlFor="shipping">SHIPPING</label>
            <select
              id="shipping"
              className={cx("input-field")}
              value={shippingCost}
              onChange={(e) => setShippingCost(Number(e.target.value))}
            >
              <option value={5.0}>Standard-Delivery - €5.00</option>
              <option value={10.0}>Express-Delivery - €10.00</option>
            </select>
          </div>

          <div className={cx("summary-group")}>
            <label htmlFor="give-code">GIVE CODE</label>
            <input
              type="text"
              id="give-code"
              className={cx("input-field")}
              placeholder="Enter your code"
            />
          </div>

          <hr className={cx("divider-bold")} />
          <div className={cx("summary-row", "total")}>
            <span>TOTAL PRICE</span>
            <span>€ {totalPrice.toFixed(2)}</span>
          </div>

          <button className={cx("register-btn")}>REGISTER</button>
        </div>
      </div>
    </div>
  );
}

export default Cart;
