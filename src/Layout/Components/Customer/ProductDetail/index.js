import { useEffect, useMemo, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import classNames from "classnames/bind";
import styles from "./ProductDetail.module.scss";
import Image from "~/Layout/Components/Customer/Image";
import Button from "~/Layout/Components/Button";
import {
  product as fetchProducts,
  useCart,
  AUTH_REQUIRED,
  useAuth,
} from "~/Api";
import toast from "react-hot-toast";

const cx = classNames.bind(styles);

export default function ProductDetail({ productId: propId, initialProduct }) {
  const { id: routeId } = useParams();
  const { addToCart } = useCart();
  const { isAuthenticated, merchantId, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const id = propId ?? routeId; // ✅ Ưu tiên prop, fallback dùng URL param

  const [product, setProduct] = useState(initialProduct || null);
  const [loading, setLoading] = useState(!initialProduct);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);
  const [activeIdx, setActiveIdx] = useState(0);

  const vnd = useMemo(
    () =>
      new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
      }).format(Number(product?.price) || 0),
    [product?.price]
  );

  useEffect(() => {
    let Cancelled = false;

    async function load() {
      if (!id || !merchantId || initialProduct) return;
      try {
        setLoading(true);
        setError("");

        const data = await fetchProducts(merchantId, { id });
        const row = data;

        const normalized = row
          ? {
              id: row.product_id ?? row.id ?? row.idx ?? String(id),
              title: row.product_name ?? row.title ?? row.name ?? "No name",
              images:
                row.images ??
                row.gallery ??
                (row.image ? [row.image] : []) ??
                (row.img ? [row.img] : []) ??
                (row.image_url ? [row.image_url] : []) ??
                [],
              price: Number(row.price) || 0,
              description:
                row.description ??
                row.desc ??
                "No description available for this product.",
              sku: row.sku ?? row.code ?? null,
              stock: typeof row.stock === "number" ? row.stock : null,
              category: row.category ?? row.cat ?? null,
              attrs: row.attrs ?? row.attributes ?? {},
            }
          : null;

        if (!Cancelled) setProduct(normalized);
      } catch (e) {
        if (!Cancelled) setError(e.message || "Cannot load product details.");
      } finally {
        if (!Cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      Cancelled = true;
    };
  }, [id, initialProduct, merchantId]);

  function inc() {
    setQty((q) => Math.min(99, q + 1));
  }
  function dec() {
    setQty((q) => Math.max(1, q - 1));
  }

  const handleAddToCart = async () => {
    try {
      if (authLoading) {
        toast.error("Loading...", { duration: 2000 });
        return;
      }
      if (!isAuthenticated) {
        const next = location.pathname + location.search + location.hash;
        navigate(`/login?next=${encodeURIComponent(next)}`);
        return;
      }
      await addToCart(
        {
          id: product.id,
          name: product.title,
          price: product.price,
          image: product.images?.[activeIdx] || product.images?.[0] || "",
          category: product.category,
        },
        qty
      );
      toast.success("Added to cart!", { duration: 2000 });
    } catch (e) {
      if (e?.message === AUTH_REQUIRED) {
        const next = location.pathname + location.search + location.hash;
        navigate(`/login?next=${encodeURIComponent(next)}`);
      } else {
        console.error(e);
        // hiện toast nếu muốn
      }
    }
  };

  if (loading) {
    return (
      <section className={cx("section")}>
        <div className={cx("container")}>
          <p>Loading product details...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={cx("section")}>
        <div className={cx("loading")}>
          <p className={cx("error")}>Error: {error}</p>
        </div>
      </section>
    );
  }

  if (!product) {
    return (
      <section className={cx("section")}>
        <div className={cx("container")}>
          <p>Product not found.</p>
        </div>
      </section>
    );
  }

  const { title, images = [], description, sku, stock, category } = product;
  const mainImg = images[activeIdx] ?? images[0] ?? "";
  console.log(product);
  return (
    <section className={cx("section")}>
      <div className={cx("container")}>
        <div className={cx("breadcrumbs")}>
          {category && <span className={cx("sep")}>/</span>}
          {category && <span className={cx("crumb")}>{category}</span>}
        </div>

        <div className={cx("layout")}>
          {/* Left: Gallery */}
          <div className={cx("media")}>
            <div className={cx("mainImgWrap")}>
              <Image src={mainImg} alt={title} className={cx("mainImg")} />
            </div>
            {images.length > 1 && (
              <div className={cx("thumbs")}>
                {images.map((src, i) => (
                  <Button
                    key={i}
                    className={cx("thumbBtn", { active: i === activeIdx })}
                    onClick={() => setActiveIdx(i)}
                    aria-label={`Xem ảnh ${i + 1}`}
                  >
                    <Image
                      src={src}
                      alt={`${title} ${i + 1}`}
                      className={cx("thumbImg")}
                    />
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Summary */}
          <div className={cx("summary")}>
            <h1 className={cx("title")}>{title}</h1>

            <div className={cx("priceRow")}>
              <span className={cx("price")}>{vnd}</span>
              {stock !== null && (
                <span className={cx("stock", { out: stock <= 0 })}>
                  {stock > 0 ? `In Stock: ${stock}` : "Out of Stock"}
                </span>
              )}
            </div>

            {sku && (
              <div className={cx("skuRow")}>
                <span className={cx("skuLabel")}>SKU:</span>
                <span className={cx("sku")}>{sku}</span>
              </div>
            )}

            <p className={cx("desc")}>{description}</p>

            <div className={cx("actions")}>
              <div className={cx("qty")}>
                <Button
                  onClick={dec}
                  aria-label="Decrease quantity"
                  className={cx("qtyBtn")}
                >
                  −
                </Button>
                <input
                  className={cx("qtyInput")}
                  type="number"
                  min={1}
                  max={99}
                  value={qty}
                  onChange={(e) =>
                    setQty(
                      Math.min(99, Math.max(1, Number(e.target.value) || 1))
                    )
                  }
                />
                <Button
                  onClick={inc}
                  aria-label="Increase quantity"
                  className={cx("qtyBtn")}
                >
                  +
                </Button>
              </div>
              <Button className={cx("addBtn")} onClick={handleAddToCart}>
                Add to Cart
              </Button>
            </div>

            {/* Optional attributes table */}
            {product.attrs && Object.keys(product.attrs).length > 0 && (
              <div className={cx("attrs")}>
                <h3>Thông số</h3>
                <table className={cx("attrTable")}>
                  <tbody>
                    {Object.entries(product.attrs).map(([k, v]) => (
                      <tr key={k}>
                        <th>{k}</th>
                        <td>{String(v)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
