import { safeJsonParse } from '../safeJson';

describe('safeJson', () => {
  describe('safeJsonParse', () => {
    it('유효한 JSON을 올바르게 파싱함', () => {
      const result = safeJsonParse('{"name":"test"}', {});
      expect(result).toEqual({ name: 'test' });
    });

    it('배열 JSON을 올바르게 파싱함', () => {
      const result = safeJsonParse<number[]>('[1, 2, 3]', []);
      expect(result).toEqual([1, 2, 3]);
    });

    it('중첩된 객체를 파싱함', () => {
      const json = '{"user":{"name":"test","age":25},"active":true}';
      const result = safeJsonParse(json, {});
      expect(result).toEqual({
        user: { name: 'test', age: 25 },
        active: true,
      });
    });

    it('null 입력 시 기본값 반환', () => {
      const result = safeJsonParse<string[]>(null, ['default']);
      expect(result).toEqual(['default']);
    });

    it('빈 문자열 시 기본값 반환', () => {
      const result = safeJsonParse('', { fallback: true });
      expect(result).toEqual({ fallback: true });
    });

    it('손상된 JSON 시 기본값 반환', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const result = safeJsonParse<number[]>('not valid json', []);
      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('불완전한 JSON 시 기본값 반환', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const result = safeJsonParse('{"incomplete":', {});
      expect(result).toEqual({});
      consoleSpy.mockRestore();
    });

    it('undefined 문자열도 처리', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const result = safeJsonParse('undefined', 'default');
      expect(result).toBe('default');
      consoleSpy.mockRestore();
    });

    it('숫자를 파싱함', () => {
      const result = safeJsonParse('42', 0);
      expect(result).toBe(42);
    });

    it('boolean을 파싱함', () => {
      expect(safeJsonParse('true', false)).toBe(true);
      expect(safeJsonParse('false', true)).toBe(false);
    });

    it('null JSON을 파싱함', () => {
      const result = safeJsonParse('null', 'fallback');
      expect(result).toBeNull();
    });

    it('특수문자가 포함된 문자열을 파싱함', () => {
      const result = safeJsonParse('"hello\\nworld"', '');
      expect(result).toBe('hello\nworld');
    });

    it('유니코드 문자를 파싱함', () => {
      const result = safeJsonParse('{"name":"펫체키"}', {});
      expect(result).toEqual({ name: '펫체키' });
    });
  });
});
