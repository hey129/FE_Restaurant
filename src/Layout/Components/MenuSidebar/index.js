// Sidebar.jsx
import { useEffect, useMemo, useState } from "react";
import classNames from "classnames/bind";
import styles from "./Sidebar.module.scss";
import { category as fetchCategories } from "~/Api"; // nhớ export named: export const category = createClient(...)

const cx = classNames.bind(styles);

export default function Sidebar({ onChange }) {
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState(null); // sẽ là category_id hoặc null
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Lấy danh mục từ API
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchCategories();
        const normalized = data
          .filter((c) => c.status !== false)
          .map((c) => ({
            id: c.category_id ?? c.idx,
            name: c.name ?? "Unnamed",
          }));
        setCategories(normalized);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  // debounce search input so we don't call parent on every keystroke
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300); // 300ms debounce
    return () => clearTimeout(t);
  }, [search]);

  // gửi bộ lọc (kết hợp category + debouncedSearch) lên parent
  useEffect(() => {
    onChange?.({ category, search: debouncedSearch });
  }, [onChange, category, debouncedSearch]);

  if (loading) {
    return (
      <div className={cx("layout")}>
        <p>Đang tải danh mục…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className={cx("layout")}>
        <p className={cx("error")}>Lỗi: {error}</p>
      </div>
    );
  }

  return (
    <div className={cx("layout")}>
      <aside className={cx("sidebar")}>
        {/* Search */}
        <div className={cx("search")}>
          <div className={cx("searchInput")}>
            <input
              name="search"
              placeholder="Tìm sản phẩm…"
              className={cx("input")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Category */}
        <div className={cx("card")}>
          <h3 className={cx("cardTitle")}>Category</h3>
          <ul className={cx("list")}>
            {/* Nút All */}
            <li>
              <button
                type="button"
                className={cx("listItem", { active: category === null })}
                onClick={() => setCategory(null)}
              >
                <span>All</span>
              </button>
            </li>

            {categories.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  className={cx("listItem", { active: category === c.id })}
                  onClick={() => setCategory(category === c.id ? null : c.id)}
                >
                  <span>{c.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
