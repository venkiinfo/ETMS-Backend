import sanitizeHtml from 'sanitize-html';

export const cleanHtml = (html: string): string =>
  sanitizeHtml(html, {
    allowedTags: ['b', 'i', 'strong', 'em', 'p', 'ul', 'ol', 'li', 'br', 'a'],
    allowedAttributes: {
      a: ['href', 'target'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    disallowedTagsMode: 'discard',
  });