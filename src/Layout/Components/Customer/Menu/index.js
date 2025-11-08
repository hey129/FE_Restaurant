import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import classNames from "classnames/bind";
import styles from "./Menu.module.scss";
import Image from "~/Layout/Components/Customer/Image";
import {
  product as fetchProducts,
  useCart,
  useAuth,
  AUTH_REQUIRED,
} from "~/Api";
import toast from "react-hot-toast";

const cx = classNames.bind(styles);

function Star({ filled }) {
  return (
    <svg
      className={cx("star", { filled })}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292z" />
    </svg>
  );
}

function MenuCard({ product }) {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const { id, img, title, price, rating = 0 } = product;

  const vnd = useMemo(
    () =>
      new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
      }).format(Number(price) || 0),
    [price]
  );

  const handleCardClick = (e) => {
    if (e.target.closest(`.${cx("btn-addtocart")}`)) {
      e.stopPropagation();
      return;
    }
    navigate(`/product/${id}`);
  };

  const handleAddToCart = async () => {
    try {
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
          image: product.img || "",
          category: product.category || null,
        },
        1
      );
      toast.success("Product added to cart!");
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

  return (
    <div
      className={cx("card", "group")}
      onClick={handleCardClick}
      style={{ cursor: "pointer" }}
    >
      <div className={cx("imgWrap")}>
        <Image src={img} alt={title} className={cx("img")} />
      </div>

      <div className={cx("metaRow")}>
        <div>
          <h3 className={cx("title")}>{title}</h3>
          <div className={cx("stars")}>
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} filled={i < rating} />
            ))}
          </div>
        </div>

        <div className={cx("priceCol")}>
          <div className={cx("price")}>
            <p>{vnd}</p>
          </div>
          <div className={cx("addtocart")}>
            <button className={cx("btn-addtocart")} onClick={handleAddToCart}>
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Menu({ filters }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError("");

        // ✅ GỌI HÀM API DUY NHẤT
        //    Giả định fetchProducts hỗ trợ nhận filters (category/search)
        const data = await fetchProducts(filters);

        // ✅ Chuẩn hoá dữ liệu về shape UI cần
        const rows = Array.isArray(data) ? data : [data];
        const normalized = rows.map((r) => ({
          id: r.id ?? r.product_id ?? r.idx,
          title: r.title ?? r.name ?? r.product_name ?? "No name",
          img: r.img ?? r.image_url ?? r.image ?? "",
          price: Number(r.price) || 0,
          rating: Math.max(0, Math.min(5, Number(r.rating) || 0)),
          category: r.category ?? r.category_id ?? null,
        }));

        if (!cancelled) setProducts(normalized);
      } catch (e) {
        if (!cancelled) setError(e.message || "Unable to load products.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [filters]); // ← Sidebar đổi filters, Menu refetch

  if (loading) {
    return (
      <section className={cx("section")}>
        <div className={cx("container")}>
          <p>Loading products...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={cx("section")}>
        <div className={cx("container")}>
          <p className={cx("error")}>Error: {error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </section>
    );
  }

  return (
    <section className={cx("section")}>
      <div className={cx("container")}>
        <div className={cx("grid")}>
          {products.map((p) => (
            <MenuCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
