import { useState, useCallback } from "react";
import classNames from "classnames/bind";
import styles from "./Menu.module.scss";
import Sidebar from "~/Layout/Components/Customer/MenuSidebar";
import Menu from "~/Layout/Components/Customer/Menu";
import ScrollToTopButton from "~/Layout/Components/Button/ScrollToTop";

const cx = classNames.bind(styles);

export default function Menupage() {
  const [filters, setFilters] = useState({
    category: null,
    search: "",
  });

  const handleFiltersChange = useCallback((next) => {
    setFilters((prev) => ({ ...prev, ...next }));
  }, []);

  return (
    <div className={cx("container")}>
      <div className={cx("sidebar")}>
        <Sidebar onChange={handleFiltersChange} />
      </div>

      <div className={cx("menu")}>
        <Menu filters={filters} />
      </div>

      <ScrollToTopButton />
    </div>
  );
}
