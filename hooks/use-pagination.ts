import { useCallback, useEffect, useState } from "react";
import { PAGINATION } from "../constants/app";

type PaginationResult<T> = {
  visibleItems: T[];
  loadMore: () => void;
  loadingMore: boolean;
  hasMore: boolean;
  reset: () => void;
};

export const usePagination = <T,>(items: T[], pageSize = PAGINATION.PAGE_SIZE): PaginationResult<T> => {
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const visibleItems = items.slice(0, page * pageSize);
  const hasMore = visibleItems.length < items.length;

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    setTimeout(() => {
      setPage((prev) => prev + 1);
      setLoadingMore(false);
    }, 300);
  }, [loadingMore, hasMore]);

  const reset = useCallback(() => {
    setPage(1);
  }, []);

  useEffect(() => {
    reset();
  }, [items.length, reset]);

  return {
    visibleItems,
    loadMore,
    loadingMore,
    hasMore,
    reset,
  };
};
