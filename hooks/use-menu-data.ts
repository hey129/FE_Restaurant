import { useEffect, useState } from "react";
import {
  Category,
  MenuItem,
  getCategories,
  getMenuItems,
} from "../services/menuService";

type MenuData = {
  categories: Category[];
  menuItems: MenuItem[];
  loading: boolean;
  error: Error | null;
  retry: () => void;
};

export const useMenuData = (): MenuData => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [cats, menu] = await Promise.all([
          getCategories(),
          getMenuItems(),
        ]);

        if (!mounted) return;

        setCategories(cats);
        setMenuItems(menu);
      } catch (err) {
        if (!mounted) return;
        setError(err as Error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [retryCount]);

  const retry = () => setRetryCount((prev) => prev + 1);

  return {
    categories,
    menuItems,
    loading,
    error,
    retry,
  };
};
