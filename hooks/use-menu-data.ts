import { useEffect, useState } from "react";
import {
    BestSeller,
    Category,
    MenuItem,
    Recommend,
    getBestSellers,
    getCategories,
    getMenuItems,
    getRecommends,
} from "../services/menuService";
import { AppError } from "../utils/errorHandler";

type MenuData = {
  categories: Category[];
  bestSellers: BestSeller[];
  recommends: Recommend[];
  menuItems: MenuItem[];
  loading: boolean;
  error: AppError | null;
  retry: () => void;
};

export const useMenuData = (): MenuData => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [bestSellers, setBestSellers] = useState<BestSeller[]>([]);
  const [recommends, setRecommends] = useState<Recommend[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [cats, best, recs, menu] = await Promise.all([
          getCategories(),
          getBestSellers(),
          getRecommends(),
          getMenuItems(),
        ]);

        if (!mounted) return;

        setCategories(cats);
        setBestSellers(best);
        setRecommends(recs);
        setMenuItems(menu);
      } catch (err) {
        if (!mounted) return;
        setError(err as AppError);
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
    bestSellers,
    recommends,
    menuItems,
    loading,
    error,
    retry,
  };
};
