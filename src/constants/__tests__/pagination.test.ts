import { PAGINATION_CONFIG } from '../pagination';

describe('Pagination Constants', () => {
  it('should have the correct default page value', () => {
    expect(PAGINATION_CONFIG.DEFAULT_PAGE).toBe(1);
  });

  it('should have the correct default limit value', () => {
    expect(PAGINATION_CONFIG.DEFAULT_LIMIT).toBe(10);
  });

  it('should have the correct max limit value', () => {
    expect(PAGINATION_CONFIG.MAX_LIMIT).toBe(50);
  });

  it('should not allow modification of values', () => {
    expect(() => {
      // @ts-ignore: Testing runtime immutability
      PAGINATION_CONFIG.DEFAULT_PAGE = 2;
    }).toThrow();
  });
});