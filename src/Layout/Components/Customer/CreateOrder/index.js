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

  const { user: profile, isAuthenticated, loading } = useAuth();
  const { items, clearCartForMerchants } = useCart();

  const selectedMerchants = useMemo(
    () => location.state?.selectedMerchants || [],
    [location.state?.selectedMerchants]
  );

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

  // Redirect to login if not authenticated (wait for auth to load first)
  useEffect(() => {
    if (loading) return; // Wait for auth state to load

    if (!isAuthenticated) {
      const next = location.pathname + location.search + location.hash;
      navigate(`/login?next=${encodeURIComponent(next)}`);
    }
  }, [loading, isAuthenticated, navigate, location]);

  // Redirect if cart is empty or no merchants selected
  useEffect(() => {
    if (
      isAuthenticated &&
      (items.length === 0 || selectedMerchants.length === 0)
    ) {
      toast.error("No items or stores selected", 2000);
      navigate("/cart");
    }
  }, [isAuthenticated, items.length, selectedMerchants.length, navigate]);

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

  // Group selected items by merchant and calculate totals
  const itemsByMerchant = useMemo(() => {
    const grouped = new Map();
    // Only include items from selected merchants
    items.forEach((item) => {
      if (selectedMerchants.includes(item.merchant_id)) {
        if (!grouped.has(item.merchant_id)) {
          grouped.set(item.merchant_id, {
            merchant_id: item.merchant_id,
            merchant_name: item.merchant_name,
            items: [],
          });
        }
        grouped.get(item.merchant_id).items.push(item);
      }
    });
    const result = Array.from(grouped.values());
    console.log("📦 itemsByMerchant groups:", result.length, result);
    console.log("🎯 selectedMerchants:", selectedMerchants);
    return result;
  }, [items, selectedMerchants]);

  const total = useMemo(() => {
    const itemsTotal = items
      .filter((x) => selectedMerchants.includes(x.merchant_id))
      .reduce((sum, it) => sum + it.price * it.quantity, 0);
    return itemsTotal + ship * itemsByMerchant.length; // shipping per merchant
  }, [items, selectedMerchants, itemsByMerchant.length, ship]);

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

    if (itemsByMerchant.length === 0) {
      toast.error("No items to order", { duration: 2000 });
      return;
    }

    if (!profile?.customer_id) {
      toast.error("User information not found", { duration: 2000 });
      return;
    }

    const deliveryAddress = useOtherAddress ? form.otherAddress : form.address;

    if (!deliveryAddress?.trim()) {
      toast.error("Please enter delivery address", { duration: 2000 });
      return;
    }

    try {
      setSubmitting(true);
      const loadingToastId = toast.loading(
        `Processing ${itemsByMerchant.length} order(s)...`
      );

      const orderIds = [];
      const paymentUrls = [];

      // Step 1: Create orders for each merchant
      for (const merchantGroup of itemsByMerchant) {
        console.log(
          `🚀 Creating order for merchant ${merchantGroup.merchant_id}...`
        );

        const { orderId } = await createOrder({
          customerId: profile.customer_id,
          merchantId: merchantGroup.merchant_id,
          items: merchantGroup.items,
          shipping: ship,
          deliveryAddress,
          note: form.note,
          paymentMethod: form.paymentMethod,
        });

        console.log(
          `✅ Order created for ${merchantGroup.merchant_name}: ${orderId}`
        );
        orderIds.push({
          orderId,
          merchantId: merchantGroup.merchant_id,
          merchantName: merchantGroup.merchant_name,
        });
      }

      // Step 2: Handle payment for each order
      if (form.paymentMethod === "MoMo") {
        // Create MoMo payments for each order
        for (const orderInfo of orderIds) {
          try {
            console.log(
              `💳 Creating MoMo payment for order ${orderInfo.orderId}...`
            );

            const paymentResponse = await createMomoPayment({
              orderId: orderInfo.orderId,
              amount:
                items
                  .filter((x) => x.merchant_id === orderInfo.merchantId)
                  .reduce((sum, it) => sum + it.price * it.quantity, 0) + ship,
              orderInfo: `Payment for order #${orderInfo.orderId} - ${orderInfo.merchantName}`,
            });

            console.log(
              `💳 MoMo response for order ${orderInfo.orderId}:`,
              paymentResponse
            );

            if (paymentResponse.success && paymentResponse.payUrl) {
              paymentUrls.push(paymentResponse.payUrl);
            } else {
              throw new Error(
                paymentResponse.message ||
                  `Cannot connect to MoMo for order ${orderInfo.orderId}`
              );
            }
          } catch (err) {
            console.error(`Payment error for order ${orderInfo.orderId}:`, err);
            throw err;
          }
        }

        // Step 3: Clear cart for selected merchants
        console.log("✅ All payments ready, clearing cart...");
        const merchantIds = itemsByMerchant.map((m) => m.merchant_id);
        await clearCartForMerchants(merchantIds);

        // Dismiss loading and show success
        toast.dismiss(loadingToastId);
        toast.success(
          `${orderIds.length} order(s) created! Opening payment windows...`,
          {
            duration: 2000,
          }
        );

        // Step 4: Handle payment redirects
        if (paymentUrls.length > 0) {
          console.log(
            `🎉 Total payment URLs created: ${paymentUrls.length}`,
            paymentUrls
          );

          // Store payment info in sessionStorage for multi-payment handling
          sessionStorage.setItem(
            "paymentQueue",
            JSON.stringify({
              urls: paymentUrls,
              orderIds: orderIds,
              currentIndex: 0,
            })
          );

          // Open all payment windows with small delays to avoid popup blocker
          paymentUrls.forEach((url, index) => {
            console.log(
              `🪟 Opening payment window ${index + 1}/${paymentUrls.length}`
            );
            // Use setTimeout to prevent popup blocker from blocking multiple opens
            setTimeout(() => {
              const opened = window.open(url, `_blank_payment_${index}`);
              if (!opened) {
                console.warn(
                  `⚠️  Popup blocked for window ${index + 1}. URL: ${url}`
                );
                toast.error(
                  `Payment window ${
                    index + 1
                  } was blocked by popup blocker. Please allow popups.`
                );
              } else {
                console.log(
                  `✅ Payment window ${index + 1} opened successfully`
                );
              }
            }, index * 300); // 300ms delay between each popup
          });

          // Navigate to orders page after a delay
          setTimeout(() => {
            setSubmitting(false);
            navigate("/profile/order");
          }, 2000);
        }
      } else {
        // For COD, just clear cart and show success
        const merchantIds = itemsByMerchant.map((m) => m.merchant_id);
        await clearCartForMerchants(merchantIds);
        toast.dismiss(loadingToastId);
        toast.success(`${orderIds.length} order(s) created successfully!`, {
          duration: 2000,
        });
        setSubmitting(false);

        setTimeout(() => {
          navigate("/profile/order");
        }, 1500);
      }
    } catch (err) {
      console.error("❌ Order creation error:", err);
      toast.dismiss();
      toast.error(err.message || "Order creation failed", { duration: 2000 });
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
              {itemsByMerchant.flatMap((mg) =>
                mg.items.map((it) => (
                  <div
                    key={`${it.merchant_id}:${it.id}`}
                    className={cx("summaryItem")}
                  >
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
                ))
              )}
            </div>
            <hr />
            <div className={cx("rowPrice")}>
              <span>Subtotal</span>
              <strong>
                {formatVND(
                  items
                    .filter((x) => selectedMerchants.includes(x.merchant_id))
                    .reduce((sum, it) => sum + it.price * it.quantity, 0)
                )}
              </strong>
            </div>
            <div className={cx("rowPrice")}>
              <span>Shipping Fee</span>
              <strong>{formatVND(ship * selectedMerchants.length)}</strong>
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
