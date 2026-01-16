import {
  sanitizeHtml,
  sanitizeTitle,
  sanitizeContent,
  sanitizeUsername,
  sanitizeUrl,
  sanitizeSearchQuery,
  anonymizeEmail,
  sanitizeObject,
} from '../sanitize';

describe('sanitize utilities', () => {
  describe('sanitizeHtml', () => {
    it('should escape HTML special characters', () => {
      const input = '<script>alert("xss")</script>';
      const result = sanitizeHtml(input);
      expect(result).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
      );
    });

    it('should escape ampersands', () => {
      expect(sanitizeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
    });

    it('should escape quotes', () => {
      expect(sanitizeHtml("It's a \"test\"")).toBe(
        'It&#x27;s a &quot;test&quot;'
      );
    });

    it('should handle empty input', () => {
      expect(sanitizeHtml('')).toBe('');
      expect(sanitizeHtml(null as unknown as string)).toBe('');
      expect(sanitizeHtml(undefined as unknown as string)).toBe('');
    });

    it('should preserve normal text', () => {
      expect(sanitizeHtml('Hello World')).toBe('Hello World');
      expect(sanitizeHtml('안녕하세요')).toBe('안녕하세요');
    });
  });

  describe('sanitizeTitle', () => {
    it('should sanitize and trim title', () => {
      const input = '  <script>Test Title</script>  ';
      const result = sanitizeTitle(input);
      expect(result).toBe('&lt;script&gt;Test Title&lt;&#x2F;script&gt;');
    });

    it('should limit length', () => {
      const longTitle = 'a'.repeat(200);
      const result = sanitizeTitle(longTitle, 100);
      expect(result.length).toBe(100);
    });

    it('should use default max length of 100', () => {
      const longTitle = 'a'.repeat(150);
      const result = sanitizeTitle(longTitle);
      expect(result.length).toBe(100);
    });
  });

  describe('sanitizeContent', () => {
    it('should preserve single line breaks', () => {
      const input = 'Line 1\nLine 2';
      const result = sanitizeContent(input);
      expect(result).toBe('Line 1\nLine 2');
    });

    it('should limit consecutive line breaks to 2', () => {
      const input = 'Line 1\n\n\n\n\nLine 2';
      const result = sanitizeContent(input);
      expect(result).toBe('Line 1\n\nLine 2');
    });

    it('should normalize Windows line endings', () => {
      const input = 'Line 1\r\nLine 2';
      const result = sanitizeContent(input);
      expect(result).toBe('Line 1\nLine 2');
    });

    it('should limit length to 5000 by default', () => {
      const longContent = 'a'.repeat(6000);
      const result = sanitizeContent(longContent);
      expect(result.length).toBe(5000);
    });
  });

  describe('sanitizeUsername', () => {
    it('should allow alphanumeric and Korean characters', () => {
      expect(sanitizeUsername('user123')).toBe('user123');
      expect(sanitizeUsername('사용자')).toBe('사용자');
      expect(sanitizeUsername('user_name-1')).toBe('user_name-1');
    });

    it('should remove special characters', () => {
      expect(sanitizeUsername('user<script>')).toBe('userscript');
      expect(sanitizeUsername('user@email')).toBe('useremail');
    });

    it('should limit length', () => {
      const longName = 'a'.repeat(50);
      const result = sanitizeUsername(longName, 30);
      expect(result.length).toBe(30);
    });
  });

  describe('sanitizeUrl', () => {
    it('should allow http and https URLs', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
      expect(sanitizeUrl('http://example.com')).toBe('http://example.com');
    });

    it('should allow mailto URLs', () => {
      expect(sanitizeUrl('mailto:test@example.com')).toBe(
        'mailto:test@example.com'
      );
    });

    it('should block javascript URLs', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBeNull();
    });

    it('should block data URLs', () => {
      expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBeNull();
    });

    it('should allow relative paths', () => {
      expect(sanitizeUrl('/path/to/page')).toBe('/path/to/page');
    });

    it('should block protocol-relative URLs', () => {
      expect(sanitizeUrl('//example.com')).toBeNull();
    });

    it('should handle invalid URLs', () => {
      expect(sanitizeUrl('not a url')).toBeNull();
      expect(sanitizeUrl('')).toBeNull();
    });
  });

  describe('sanitizeSearchQuery', () => {
    it('should remove SQL injection characters', () => {
      const input = "'; DROP TABLE users; --";
      const result = sanitizeSearchQuery(input);
      expect(result).not.toContain("'");
      expect(result).not.toContain(';');
      expect(result).not.toContain('--');
    });

    it('should remove comment markers', () => {
      expect(sanitizeSearchQuery('test /* comment */')).not.toContain('/*');
      expect(sanitizeSearchQuery('test /* comment */')).not.toContain('*/');
    });

    it('should preserve normal search terms', () => {
      expect(sanitizeSearchQuery('펫 건강 상담')).toBe('펫 건강 상담');
    });

    it('should limit length', () => {
      const longQuery = 'a'.repeat(200);
      const result = sanitizeSearchQuery(longQuery, 100);
      expect(result.length).toBe(100);
    });
  });

  describe('anonymizeEmail', () => {
    it('should anonymize email local part', () => {
      expect(anonymizeEmail('example@domain.com')).toBe('exa***');
      expect(anonymizeEmail('test@test.com')).toBe('tes***');
    });

    it('should handle short local parts', () => {
      expect(anonymizeEmail('ab@domain.com')).toBe('a***');
      expect(anonymizeEmail('a@domain.com')).toBe('a***');
    });

    it('should handle invalid emails', () => {
      expect(anonymizeEmail('')).toBe('익명');
      expect(anonymizeEmail('notanemail')).toBe('익명');
      expect(anonymizeEmail('@domain.com')).toBe('익명');
    });
  });

  describe('sanitizeObject', () => {
    it('should sanitize specified fields', () => {
      const input = {
        title: '<script>Title</script>',
        content: 'Normal content\n\n\n\nWith breaks',
        author: 'user<>name',
        id: 123,
      };

      const result = sanitizeObject(input, {
        title: 'title',
        content: 'content',
        author: 'username',
      });

      expect(result.title).toBe('&lt;script&gt;Title&lt;&#x2F;script&gt;');
      expect(result.content).toBe('Normal content\n\nWith breaks');
      expect(result.author).toBe('username');
      expect(result.id).toBe(123); // non-string field unchanged
    });

    it('should not modify original object', () => {
      const input = { title: '<b>Bold</b>' };
      const result = sanitizeObject(input, { title: 'html' });

      expect(input.title).toBe('<b>Bold</b>');
      expect(result.title).toBe('&lt;b&gt;Bold&lt;&#x2F;b&gt;');
    });
  });
});
