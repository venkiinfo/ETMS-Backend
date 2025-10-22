export const PAGINATION_CONFIG = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 50, 
  SIZES: [10, 25, 50] as const 
} as const;

export type PaginationConfig = typeof PAGINATION_CONFIG;