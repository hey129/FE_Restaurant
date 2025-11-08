import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import classNames from "classnames/bind";
import styles from "./CreateOrder.module.scss";
import { useAuth, useCart, createOrder, createMomoPayment } from "~/Api";
import toast, { Toaster } from "react-hot-toast";

const cx = classNames.bind(styles);

const formatVND = (n) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Math.round(Number(n) || 0));

export default function CreateOrder() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user: profile, isAuthenticated } = useAuth();
  const { items, subtotal, clearCart } = useCart();

  const [ship, setShip] = useState(15000);
  const [useOtherAddress, setUseOtherAddress] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    otherAddress: "",
    note: "",
    paymentMethod: "MoMo",
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      const next = location.pathname + location.search + location.hash;
      navigate(`/login?next=${encodeURIComponent(next)}`);
    }
  }, [isAuthenticated, navigate, location]);

  // Redirect if cart is empty
  useEffect(() => {
    if (isAuthenticated && items.length === 0) {
      toast.error("Cart is empty", { duration: 3000 });
      navigate("/cart");
    }
  }, [isAuthenticated, items.length, navigate]);

  // Load user profile data into form
  useEffect(() => {
    if (profile) {
      setForm((f) => ({
        ...f,
        name: profile.customer_name || "",
        phone: profile.phone || "",
        address: profile.address || "",
      }));
    }
  }, [profile]);

  const total = useMemo(() => subtotal + ship, [subtotal, ship]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const submit = async (e) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (submitting) {
      console.log(
        " Submission already in progress, ignoring duplicate request"
      );
      return;
    }

    if (!items.length) {
      toast.error("Cart is empty", { duration: 3000 });
      return;
    }

    if (!profile?.customer_id) {
      toast.error("User information not found", { duration: 3000 });
      return;
    }

    const deliveryAddress = useOtherAddress ? form.otherAddress : form.address;

    if (!deliveryAddress?.trim()) {
      toast.error("Please enter delivery address", { duration: 3000 });
      return;
    }

    try {
      setSubmitting(true);
      toast.loading("Processing order...", { duration: 3000 });

      // Handle MoMo payment
      if (form.paymentMethod === "MoMo") {
        try {
          // Step 1: Create order first
          console.log("🚀 Creating order...");
          const { orderId } = await createOrder({
            customerId: profile.customer_id,
            items,
            shipping: ship,
            deliveryAddress,
            note: form.note,
            paymentMethod: form.paymentMethod,
          });

          console.log("✅ Order created:", orderId);

          // Step 2: Create MoMo payment
          toast.dismiss();
          toast.loading("Connecting to MoMo...", { duration: 3000 });

          const paymentResponse = await createMomoPayment({
            orderId,
            amount: total,
            orderInfo: `Payment for order #${orderId}`,
          });

          console.log("💳 MoMo response:", paymentResponse);

          // Step 3: Verify MoMo payment URL
          if (!paymentResponse.success || !paymentResponse.payUrl) {
            throw new Error(
              paymentResponse.message ||
                "Cannot connect to MoMo. Please try again later."
            );
          }

          // Step 4: Clear cart and redirect
          console.log("✅ MoMo ready, clearing cart...");
          await clearCart();

          toast.dismiss();
          toast.success("Redirecting to MoMo payment page...", {
            duration: 3000,
          });

          // Redirect to MoMo payment page
          setTimeout(() => {
            window.location.href = paymentResponse.payUrl;
          }, 500);
        } catch (paymentError) {
          console.error("❌ Payment error:", paymentError);
          toast.dismiss();
          toast.error(
            paymentError.message ||
              "Cannot connect to MoMo. Your order has been created but not paid. Please contact support.",
            { duration: 3000 }
          );
          setSubmitting(false);
        }
      } else {
        toast.dismiss();
        toast.error("Invalid payment method", { duration: 3000 });
        setSubmitting(false);
      }
    } catch (err) {
      console.error("❌ Order creation error:", err);
      toast.dismiss();
      toast.error(err.message || "Order creation failed. Please try again.", {
        duration: 3000,
      });
      setSubmitting(false);
    }
  };

  return (
    <section className={cx("section")}>
      <Toaster position="top-right" />
      <div className={cx("container")}>
        <div className={cx("grid")}>
          {/* FORM */}
          <div className={cx("card")}>
            <h3 className={cx("title")}>Delivery Information</h3>
            <form className={cx("form")} onSubmit={submit}>
              <div className={cx("row2")}>
                <div className={cx("formGroup")}>
                  <label>Full Name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                  />
                </div>
                <div className={cx("formGroup")}>
                  <label>Phone</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="09xx xxx xxx"
                  />
                </div>
              </div>
              <div className={cx("formGroup")}>
                <label>Default Address</label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Street, ward, district, city"
                />
              </div>
              <div className={cx("formCheck")}>
                <input
                  id="useOther"
                  type="checkbox"
                  checked={useOtherAddress}
                  onChange={() => setUseOtherAddress((v) => !v)}
                />
                <label htmlFor="useOther">Deliver to another address</label>
              </div>
              {useOtherAddress && (
                <div className={cx("formGroup")}>
                  <label>Other Address</label>
                  <textarea
                    name="otherAddress"
                    value={form.otherAddress}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Enter delivery address..."
                  />
                </div>
              )}
              <div className={cx("row2")}>
                <div className={cx("formGroup")}>
                  <label>Payment Method</label>
                  <select
                    name="paymentMethod"
                    value={form.paymentMethod}
                    onChange={handleChange}
                  >
                    <option value="MoMo">💳 MoMo</option>
                  </select>
                </div>

                <div className={cx("formGroup")}>
                  <label>Shipping Fee</label>
                  <select
                    value={ship}
                    onChange={(e) => setShip(Number(e.target.value))}
                  >
                    <option value={15000}>Standard – {formatVND(15000)}</option>
                    <option value={30000}>Express – {formatVND(30000)}</option>
                  </select>
                </div>
              </div>
              <div className={cx("formGroup")}>
                <label>Note</label>
                <textarea
                  name="note"
                  value={form.note}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
              <button
                className={cx("btnPrimary")}
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Processing..." : "Confirm Order"}
              </button>
            </form>
          </div>

          {/* SUMMARY */}
          <div className={cx("card")}>
            <h3 className={cx("title")}>Order Summary</h3>
            <div className={cx("summaryList")}>
              {items.map((it) => (
                <div key={it.id} className={cx("summaryItem")}>
                  <div className={cx("info")}>
                    <img src={it.image} alt={it.name} />
                    <div>
                      <div className={cx("name")}>{it.name}</div>
                      <div className={cx("sub")}>x {it.quantity}</div>
                    </div>
                  </div>
                  <div className={cx("price")}>
                    {formatVND(it.price * it.quantity)}
                  </div>
                </div>
              ))}
            </div>
            <hr />
            <div className={cx("rowPrice")}>
              <span>Subtotal</span>
              <strong>{formatVND(subtotal)}</strong>
            </div>
            <div className={cx("rowPrice")}>
              <span>Shipping Fee</span>
              <strong>{formatVND(ship)}</strong>
            </div>
            <div className={cx("rowPrice", "total")}>
              <span>Total</span>
              <strong>{formatVND(total)}</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
