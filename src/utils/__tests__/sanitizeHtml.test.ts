import { cleanHtml } from '../sanitizeHtml';

describe('sanitizeHtml Utility', () => {
  it('should allow safe HTML tags', () => {
    const input = `
      <p>Hello <strong>World</strong>!</p>
      <ul>
        <li>Item 1</li>
        <li>Item 2</li>
      </ul>
      <a href="https://example.com" target="_blank">Link</a>
    `;

    const result = cleanHtml(input);

    expect(result).toContain('<p>');
    expect(result).toContain('<strong>');
    expect(result).toContain('<ul>');
    expect(result).toContain('<li>');
    expect(result).toContain('<a href="https://example.com" target="_blank">');
  });

  it('should remove unsafe HTML tags', () => {
    const input = `
      <p>Safe content</p>
      <script>alert('xss');</script>
      <iframe src="malicious.html"></iframe>
      <img src="image.jpg" onerror="malicious()">
    `;

    const result = cleanHtml(input);

    expect(result).toContain('<p>Safe content</p>');
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('<iframe');
    expect(result).not.toContain('<img');
  });

  it('should clean malicious attributes', () => {
    const input = `
      <a href="javascript:alert('xss')" onclick="malicious()">Click me</a>
      <p onmouseover="hack()">Hover me</p>
    `;

    const result = cleanHtml(input);

    expect(result).not.toContain('javascript:');
    expect(result).not.toContain('onclick');
    expect(result).not.toContain('onmouseover');
  });

  it('should only allow safe URL schemes', () => {
    const input = `
      <a href="https://safe.com">Safe link</a>
      <a href="http://also-safe.com">Also safe</a>
      <a href="mailto:test@example.com">Email</a>
      <a href="data:text/html,<script>alert('xss')</script>">Unsafe</a>
      <a href="file:///etc/passwd">Very unsafe</a>
    `;

    const result = cleanHtml(input);

    expect(result).toContain('href="https://safe.com"');
    expect(result).toContain('href="http://also-safe.com"');
    expect(result).toContain('href="mailto:test@example.com"');
    expect(result).not.toContain('href="data:');
    expect(result).not.toContain('href="file:');
  });

  it('should handle empty input', () => {
    expect(cleanHtml('')).toBe('');
  });

  it('should handle null or undefined input', () => {
    expect(() => cleanHtml(null as unknown as string)).not.toThrow();
    expect(() => cleanHtml(undefined as unknown as string)).not.toThrow();
  });
});