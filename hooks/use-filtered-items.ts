import { useMemo } from "react";
import { MenuItem } from "../services/menuService";

type FilterOptions = {
  searchText: string;
  categoryId: number | null;
};

export const useFilteredItems = (items: MenuItem[], filters: FilterOptions): MenuItem[] => {
  return useMemo(() => {
    return items.filter((item) => {
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        if (!item.name.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      if (filters.categoryId !== null && item.categoryId !== filters.categoryId) {
        return false;
      }

      return true;
    });
  }, [items, filters.searchText, filters.categoryId]);
};
