import { fetchWithRetry, postJson, getJson } from '../fetch';

// fetch 모킹
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('fetchWithRetry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('성공 케이스', () => {
    it('JSON 응답을 올바르게 파싱함', async () => {
      const mockData = { message: 'success' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(mockData),
      });

      const promise = fetchWithRetry('/api/test');
      jest.runAllTimers();
      const result = await promise;

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
      expect(result.status).toBe(200);
      expect(result.retryCount).toBe(0);
    });

    it('텍스트 응답을 올바르게 처리함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'text/plain' }),
        text: () => Promise.resolve('plain text response'),
      });

      const promise = fetchWithRetry('/api/test');
      jest.runAllTimers();
      const result = await promise;

      expect(result.data).toBe('plain text response');
      expect(result.error).toBeNull();
    });
  });

  describe('재시도 로직', () => {
    it('429 에러 시 재시도함', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          headers: new Headers(),
          json: () => Promise.resolve({ error: 'Rate limited' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: () => Promise.resolve({ success: true }),
        });

      const promise = fetchWithRetry('/api/test', { maxRetries: 3, initialDelay: 100 });

      // 첫 번째 호출 후 재시도 대기
      await jest.advanceTimersByTimeAsync(200);

      const result = await promise;

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result.data).toEqual({ success: true });
      expect(result.retryCount).toBe(1);
    });

    it('500 에러 시 재시도함', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          headers: new Headers(),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: () => Promise.resolve({ success: true }),
        });

      const promise = fetchWithRetry('/api/test', { maxRetries: 3, initialDelay: 100 });
      await jest.advanceTimersByTimeAsync(200);
      const result = await promise;

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result.data).toEqual({ success: true });
    });

    it('최대 재시도 횟수 초과 시 에러 반환', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 503,
        headers: new Headers(),
      });

      const promise = fetchWithRetry('/api/test', { maxRetries: 2, initialDelay: 100 });

      // 모든 재시도 완료될 때까지 타이머 진행
      await jest.advanceTimersByTimeAsync(1000);

      const result = await promise;

      expect(mockFetch).toHaveBeenCalledTimes(3); // 초기 + 2회 재시도
      expect(result.error).toBeTruthy();
      expect(result.retryCount).toBe(2);
    });

    it('Retry-After 헤더를 존중함', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          headers: new Headers({ 'Retry-After': '2' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: () => Promise.resolve({ success: true }),
        });

      const promise = fetchWithRetry('/api/test', { maxRetries: 1, initialDelay: 100 });

      // Retry-After가 2초이므로 2초 대기
      await jest.advanceTimersByTimeAsync(2100);

      await promise;

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('클라이언트 에러', () => {
    it('400 에러는 재시도하지 않음', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ error: 'Bad request' }),
      });

      const promise = fetchWithRetry('/api/test');
      jest.runAllTimers();
      const result = await promise;

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result.error?.message).toBe('Bad request');
      expect(result.status).toBe(400);
      expect(result.retryCount).toBe(0);
    });

    it('401 에러는 재시도하지 않음', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ message: 'Unauthorized' }),
      });

      const promise = fetchWithRetry('/api/test');
      jest.runAllTimers();
      const result = await promise;

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result.error?.message).toBe('Unauthorized');
    });

    it('404 에러는 재시도하지 않음', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({}),
      });

      const promise = fetchWithRetry('/api/test');
      jest.runAllTimers();
      const result = await promise;

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result.error?.message).toBe('HTTP 404');
    });
  });

  describe('네트워크 에러', () => {
    it('네트워크 에러 시 재시도함', async () => {
      const networkError = new Error('NetworkError');
      networkError.name = 'NetworkError';

      mockFetch
        .mockRejectedValueOnce(networkError)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: () => Promise.resolve({ success: true }),
        });

      const promise = fetchWithRetry('/api/test', { maxRetries: 2, initialDelay: 100 });
      await jest.advanceTimersByTimeAsync(200);
      const result = await promise;

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result.data).toEqual({ success: true });
      expect(result.retryCount).toBe(1);
    });
  });

  describe('타임아웃', () => {
    it('타임아웃 시 AbortController로 요청 취소', async () => {
      // AbortController 모킹
      const mockAbort = jest.fn();
      const mockAbortController = {
        abort: mockAbort,
        signal: new AbortController().signal,
      };
      jest.spyOn(global, 'AbortController').mockImplementation(
        () => mockAbortController as unknown as AbortController
      );

      mockFetch.mockImplementation(() => new Promise(() => {})); // 응답 없음

      const promise = fetchWithRetry('/api/test', { timeout: 1000, maxRetries: 0 });

      // 타임아웃 발생
      jest.advanceTimersByTime(1100);

      // abort가 호출되었는지 확인
      expect(mockAbort).toHaveBeenCalled();

      // 타이머 정리
      jest.useRealTimers();
    });
  });
});

describe('postJson', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST 요청을 올바르게 전송함', async () => {
    const mockData = { id: 1 };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve(mockData),
    });

    const result = await postJson('/api/test', { name: 'test' });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/test',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ name: 'test' }),
      })
    );
    expect(result.data).toEqual(mockData);
  });
});

describe('getJson', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET 요청을 올바르게 전송함', async () => {
    const mockData = { items: [] };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve(mockData),
    });

    const result = await getJson('/api/test');

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/test',
      expect.objectContaining({
        method: 'GET',
      })
    );
    expect(result.data).toEqual(mockData);
  });
});
