/**
 * useGeolocation Hook Tests
 *
 * Tests for the geolocation hook that:
 * - Gets user's current position
 * - Handles geolocation errors gracefully
 * - Falls back to default location (Seoul City Hall)
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useGeolocation } from '../useGeolocation';

// Default location (Seoul City Hall)
const DEFAULT_LOCATION = {
  latitude: 37.5665,
  longitude: 126.978,
};

// Mock geolocation position
const mockPosition = {
  coords: {
    latitude: 37.5,
    longitude: 127.0,
    accuracy: 10,
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    speed: null,
  },
  timestamp: Date.now(),
};

describe('useGeolocation', () => {
  let mockGetCurrentPosition: jest.Mock;
  let originalGeolocation: Geolocation;

  beforeEach(() => {
    mockGetCurrentPosition = jest.fn();
    originalGeolocation = navigator.geolocation;

    // Setup geolocation mock
    Object.defineProperty(navigator, 'geolocation', {
      value: {
        getCurrentPosition: mockGetCurrentPosition,
        watchPosition: jest.fn(),
        clearWatch: jest.fn(),
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    // Restore original geolocation
    Object.defineProperty(navigator, 'geolocation', {
      value: originalGeolocation,
      writable: true,
      configurable: true,
    });
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should start with loading state', () => {
      mockGetCurrentPosition.mockImplementation(() => {
        // Don't call callback immediately
      });

      const { result } = renderHook(() => useGeolocation());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.latitude).toBeNull();
      expect(result.current.longitude).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should request location on mount', () => {
      mockGetCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });

      renderHook(() => useGeolocation());

      expect(mockGetCurrentPosition).toHaveBeenCalledTimes(1);
    });
  });

  describe('successful location retrieval', () => {
    it('should update state with position on success', async () => {
      mockGetCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });

      const { result } = renderHook(() => useGeolocation());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.latitude).toBe(37.5);
      expect(result.current.longitude).toBe(127.0);
      expect(result.current.error).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should handle permission denied error', async () => {
      const permissionError = {
        code: 1, // PERMISSION_DENIED
        message: 'User denied geolocation',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      };

      mockGetCurrentPosition.mockImplementation((success, error) => {
        error(permissionError);
      });

      const { result } = renderHook(() => useGeolocation());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toContain('권한이 거부');
      expect(result.current.latitude).toBe(DEFAULT_LOCATION.latitude);
      expect(result.current.longitude).toBe(DEFAULT_LOCATION.longitude);
    });

    it('should handle position unavailable error', async () => {
      const unavailableError = {
        code: 2, // POSITION_UNAVAILABLE
        message: 'Position unavailable',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      };

      mockGetCurrentPosition.mockImplementation((success, error) => {
        error(unavailableError);
      });

      const { result } = renderHook(() => useGeolocation());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toContain('사용할 수 없습니다');
      expect(result.current.latitude).toBe(DEFAULT_LOCATION.latitude);
      expect(result.current.longitude).toBe(DEFAULT_LOCATION.longitude);
    });

    it('should handle timeout error', async () => {
      const timeoutError = {
        code: 3, // TIMEOUT
        message: 'Timeout',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      };

      mockGetCurrentPosition.mockImplementation((success, error) => {
        error(timeoutError);
      });

      const { result } = renderHook(() => useGeolocation());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toContain('시간이 초과');
      expect(result.current.latitude).toBe(DEFAULT_LOCATION.latitude);
      expect(result.current.longitude).toBe(DEFAULT_LOCATION.longitude);
    });
  });

  describe('unsupported browser', () => {
    it('should handle browsers without geolocation support', async () => {
      // Remove geolocation
      Object.defineProperty(navigator, 'geolocation', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useGeolocation());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toContain('지원하지 않는 브라우저');
      expect(result.current.latitude).toBe(DEFAULT_LOCATION.latitude);
      expect(result.current.longitude).toBe(DEFAULT_LOCATION.longitude);
    });
  });

  describe('requestLocation function', () => {
    it('should allow manual location refresh', async () => {
      let callCount = 0;
      mockGetCurrentPosition.mockImplementation((success) => {
        callCount++;
        success({
          ...mockPosition,
          coords: {
            ...mockPosition.coords,
            latitude: 37.5 + callCount * 0.1,
          },
        });
      });

      const { result } = renderHook(() => useGeolocation());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const initialLat = result.current.latitude;

      // Request location again
      act(() => {
        result.current.requestLocation();
      });

      await waitFor(() => {
        expect(result.current.latitude).not.toBe(initialLat);
      });

      expect(mockGetCurrentPosition).toHaveBeenCalledTimes(2);
    });

    it('should set loading state when requesting location', async () => {
      mockGetCurrentPosition.mockImplementation((success) => {
        // Delay the response
        setTimeout(() => success(mockPosition), 100);
      });

      const { result } = renderHook(() => useGeolocation());

      // Wait for initial request to start
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });
    });
  });

  describe('geolocation options', () => {
    it('should pass correct options to getCurrentPosition', () => {
      mockGetCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });

      renderHook(() => useGeolocation());

      expect(mockGetCurrentPosition).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        expect.objectContaining({
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        })
      );
    });
  });
});
