// Pagination settings
export const PAGINATION = {
  PAGE_SIZE: 15,
  SCROLL_THRESHOLD: 300,
  END_REACHED_THRESHOLD: 0.4,
} as const;

// Pricing
export const PRICING = {
  TAX: 5,
  DELIVERY: 3,
} as const;

// UI sizes
export const SIZES = {
  CATEGORY_IMAGE: 60,
  ICON: 28,
  SEARCH_ICON: 20,
} as const;

// App color scheme (màu chính của app)
// ThemeColors cho dark/light mode nằm trong theme.ts
export const COLORS = {
  primary: "#F5CB58",
  accent: "#E95322",
  accentYellow: "#FFD35C",
  background: "#F5F5F5",
  white: "#FFFFFF",
  text: {
    primary: "#391713",
    secondary: "#676767",
    light: "#999",
  },
  cart: {
    background: "#FF6B3D",
    border: "#FF5722",
  },
} as const;

// Debounce delay for search
export const DEBOUNCE_DELAY = 200;
