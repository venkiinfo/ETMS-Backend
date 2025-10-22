/* istanbul ignore file */
export const normalizePath = (filePath: string): string => {
  if (!filePath) return '/';

  // Replace backslashes with forward slashes and collapse multiple slashes
  let normalized = filePath.replace(/\\/g, '/').replace(/\/+/g, '/');

  // Remove trailing slash unless path is just '/'
  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }

  return normalized;
};