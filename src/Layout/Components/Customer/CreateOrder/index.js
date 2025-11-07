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
      toast.error("Giỏ hàng trống", { duration: 2000 });
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
      toast.error("Giỏ hàng trống", { duration: 2000 });
      return;
    }

    if (!profile?.customer_id) {
      toast.error("Không tìm thấy thông tin người dùng", { duration: 2000 });
      return;
    }

    const deliveryAddress = useOtherAddress ? form.otherAddress : form.address;

    if (!deliveryAddress?.trim()) {
      toast.error("Vui lòng nhập địa chỉ giao hàng", { duration: 2000 });
      return;
    }

    try {
      setSubmitting(true);
      toast.loading("Đang xử lý đơn hàng...");

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
          toast.loading("Đang kết nối với MoMo...");

          const paymentResponse = await createMomoPayment({
            orderId,
            amount: total,
            orderInfo: `Thanh toán đơn hàng #${orderId}`,
          });

          console.log("💳 MoMo response:", paymentResponse);

          // Step 3: Verify MoMo payment URL
          if (!paymentResponse.success || !paymentResponse.payUrl) {
            throw new Error(
              paymentResponse.message ||
                "Không thể kết nối với MoMo. Vui lòng thử lại sau."
            );
          }

          // Step 4: Clear cart and redirect
          console.log("✅ MoMo ready, clearing cart...");
          await clearCart();

          toast.dismiss();
          toast.success("Chuyển đến trang thanh toán MoMo...");

          // Redirect to MoMo payment page
          setTimeout(() => {
            window.location.href = paymentResponse.payUrl;
          }, 500);
        } catch (paymentError) {
          console.error("❌ Payment error:", paymentError);
          toast.dismiss();
          toast.error(
            paymentError.message ||
              "Không thể kết nối với MoMo. Đơn hàng của bạn đã được tạo nhưng chưa thanh toán. Vui lòng liên hệ hỗ trợ."
          );
          setSubmitting(false);
        }
      } else {
        toast.dismiss();
        toast.error("Phương thức thanh toán không hợp lệ");
        setSubmitting(false);
      }
    } catch (err) {
      console.error("❌ Order creation error:", err);
      toast.dismiss();
      toast.error(err.message || "Tạo đơn hàng thất bại. Vui lòng thử lại.");
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
            <h3 className={cx("title")}>Thông tin giao hàng</h3>
            <form className={cx("form")} onSubmit={submit}>
              <div className={cx("row2")}>
                <div className={cx("formGroup")}>
                  <label>Họ tên</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div className={cx("formGroup")}>
                  <label>Điện thoại</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="09xx xxx xxx"
                  />
                </div>
              </div>
              <div className={cx("formGroup")}>
                <label>Địa chỉ mặc định</label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                />
              </div>
              <div className={cx("formCheck")}>
                <input
                  id="useOther"
                  type="checkbox"
                  checked={useOtherAddress}
                  onChange={() => setUseOtherAddress((v) => !v)}
                />
                <label htmlFor="useOther">Giao đến địa chỉ khác</label>
              </div>
              {useOtherAddress && (
                <div className={cx("formGroup")}>
                  <label>Địa chỉ giao khác</label>
                  <textarea
                    name="otherAddress"
                    value={form.otherAddress}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Nhập địa chỉ giao hàng khác..."
                  />
                </div>
              )}
              <div className={cx("row2")}>
                <div className={cx("formGroup")}>
                  <label>Phương thức thanh toán</label>
                  <select
                    name="paymentMethod"
                    value={form.paymentMethod}
                    onChange={handleChange}
                  >
                    <option value="MoMo">💳 MoMo</option>
                  </select>
                </div>

                <div className={cx("formGroup")}>
                  <label>Phí vận chuyển</label>
                  <select
                    value={ship}
                    onChange={(e) => setShip(Number(e.target.value))}
                  >
                    <option value={15000}>
                      Giao thường – {formatVND(15000)}
                    </option>
                    <option value={30000}>
                      Giao nhanh – {formatVND(30000)}
                    </option>
                  </select>
                </div>
              </div>
              <div className={cx("formGroup")}>
                <label>Ghi chú</label>
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
                {submitting ? "Đang xử lý..." : "Xác nhận đặt hàng"}
              </button>
            </form>
          </div>

          {/* SUMMARY */}
          <div className={cx("card")}>
            <h3 className={cx("title")}>Tóm tắt đơn hàng</h3>
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
              <span>Tạm tính</span>
              <strong>{formatVND(subtotal)}</strong>
            </div>
            <div className={cx("rowPrice")}>
              <span>Phí vận chuyển</span>
              <strong>{formatVND(ship)}</strong>
            </div>
            <div className={cx("rowPrice", "total")}>
              <span>Tổng cộng</span>
              <strong>{formatVND(total)}</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
