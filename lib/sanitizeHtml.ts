import sanitizeHtml from 'sanitize-html';

// 서버/클라이언트 양쪽에서 동작하도록 가볍게 설정한 sanitizer
export function sanitizeHtmlContent(dirty: string): string {
  if (!dirty) return '';

  return sanitizeHtml(dirty, {
    allowedTags: [
      'p', 'br', 'b', 'i', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'img',
      'h1', 'h2', 'h3', 'h4', 'blockquote', 'pre', 'code', 'span'
    ],
    allowedAttributes: {
      a: ['href', 'title', 'rel', 'target'],
      img: ['src', 'alt', 'title', 'width', 'height'],
      '*': ['class', 'style'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: {
      img: ['http', 'https', 'data']
    },
    allowProtocolRelative: true,
    transformTags: {
      'a': (tagName: string, attribs: Record<string, string>) => {
        // target 및 rel 추가로 안전한 외부 링크 처리
        const href = attribs.href || '';
        const isExternal = href && !href.startsWith('/') && !href.startsWith('#');
        return {
          tagName: 'a',
          attribs: Object.assign({}, attribs, isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
        };
      }
    }
  });
}

export default sanitizeHtmlContent;
