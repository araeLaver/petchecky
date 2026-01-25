/**
 * 커스텀 Jest 매처
 */

import { expect } from "@jest/globals";

// ============================================
// Custom Matchers
// ============================================

interface CustomMatchers<R = unknown> {
  toBeWithinRange(floor: number, ceiling: number): R;
  toBeValidDate(): R;
  toBeValidEmail(): R;
  toBeValidUrl(): R;
  toBeValidPhone(): R;
  toHaveBeenCalledAfter(mock: jest.Mock): R;
  toContainObject(object: Record<string, unknown>): R;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Expect extends CustomMatchers {}
    interface Matchers<R> extends CustomMatchers<R> {}
    interface InverseAsymmetricMatchers extends CustomMatchers {}
  }
}

expect.extend({
  /**
   * 숫자가 범위 내에 있는지 확인
   */
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },

  /**
   * 유효한 날짜 문자열인지 확인
   */
  toBeValidDate(received: string) {
    const date = new Date(received);
    const pass = !isNaN(date.getTime());
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid date`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid date`,
        pass: false,
      };
    }
  },

  /**
   * 유효한 이메일인지 확인
   */
  toBeValidEmail(received: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid email`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid email`,
        pass: false,
      };
    }
  },

  /**
   * 유효한 URL인지 확인
   */
  toBeValidUrl(received: string) {
    try {
      new URL(received);
      return {
        message: () => `expected ${received} not to be a valid URL`,
        pass: true,
      };
    } catch {
      return {
        message: () => `expected ${received} to be a valid URL`,
        pass: false,
      };
    }
  },

  /**
   * 유효한 한국 전화번호인지 확인
   */
  toBeValidPhone(received: string) {
    const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
    const pass = phoneRegex.test(received.replace(/-/g, ""));
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid phone number`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid phone number`,
        pass: false,
      };
    }
  },

  /**
   * mock이 다른 mock 이후에 호출되었는지 확인
   */
  toHaveBeenCalledAfter(received: jest.Mock, other: jest.Mock) {
    const receivedOrder = received.mock.invocationCallOrder[0];
    const otherOrder = other.mock.invocationCallOrder[0];

    if (receivedOrder === undefined || otherOrder === undefined) {
      return {
        message: () => "expected both mocks to have been called",
        pass: false,
      };
    }

    const pass = receivedOrder > otherOrder;
    if (pass) {
      return {
        message: () =>
          `expected ${received.getMockName()} not to have been called after ${other.getMockName()}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received.getMockName()} to have been called after ${other.getMockName()}`,
        pass: false,
      };
    }
  },

  /**
   * 배열이 특정 객체를 포함하는지 확인 (부분 매칭)
   */
  toContainObject(received: unknown[], object: Record<string, unknown>) {
    const pass = received.some((item) =>
      Object.entries(object).every(
        ([key, value]) =>
          item !== null &&
          typeof item === "object" &&
          key in item &&
          (item as Record<string, unknown>)[key] === value
      )
    );

    if (pass) {
      return {
        message: () =>
          `expected array not to contain object ${JSON.stringify(object)}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected array to contain object ${JSON.stringify(object)}`,
        pass: false,
      };
    }
  },
});

export {};
