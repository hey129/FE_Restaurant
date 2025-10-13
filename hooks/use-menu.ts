import { useState, useCallback } from "react";
import { MenuItem } from "../services/menuService";

export const usePagination = (items: MenuItem[], initialCount: number = 15) => {
  const [visibleCount, setVisibleCount] = useState(initialCount);
  const [loadingMore, setLoadingMore] = useState(false);

  const visibleItems = items.slice(0, visibleCount);

  const loadMore = useCallback(() => {
    if (loadingMore || visibleItems.length >= items.length) return;
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => prev + initialCount);
      setLoadingMore(false);
    }, 600);
  }, [loadingMore, visibleItems.length, items.length, initialCount]);

  return { visibleItems, loadMore, loadingMore };
};
