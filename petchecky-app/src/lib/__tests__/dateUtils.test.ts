/**
 * Date Utilities Tests
 */

import {
  formatRelativeTime,
  formatShortDate,
  formatFullDate,
  formatCompactDate,
  formatMonthYear,
  formatDateForInput,
  isSameDay,
  daysUntil,
  isWithinDays,
  getTodayString,
} from '../dateUtils';

describe('dateUtils', () => {
  // Mock Date for consistent testing
  const RealDate = Date;
  const mockNow = new Date('2025-01-15T12:00:00.000Z');

  beforeAll(() => {
    global.Date = class extends RealDate {
      constructor(...args: ConstructorParameters<typeof Date>) {
        super();
        if (args.length === 0) {
          return new RealDate(mockNow);
        }
        return new RealDate(...args);
      }
      static now() {
        return mockNow.getTime();
      }
    } as DateConstructor;
  });

  afterAll(() => {
    global.Date = RealDate;
  });

  describe('formatRelativeTime', () => {
    it('should return "방금 전" for times less than a minute ago', () => {
      const justNow = new Date(mockNow.getTime() - 30 * 1000).toISOString();
      expect(formatRelativeTime(justNow)).toBe('방금 전');
    });

    it('should return "N분 전" for times less than an hour ago', () => {
      const thirtyMinsAgo = new Date(mockNow.getTime() - 30 * 60 * 1000).toISOString();
      expect(formatRelativeTime(thirtyMinsAgo)).toBe('30분 전');
    });

    it('should return "어제" for yesterday', () => {
      const yesterday = new Date('2025-01-14T10:00:00.000Z');
      expect(formatRelativeTime(yesterday.toISOString())).toBe('어제');
    });

    it('should return "N일 전" for 2-6 days ago', () => {
      const threeDaysAgo = new Date('2025-01-12T12:00:00.000Z');
      expect(formatRelativeTime(threeDaysAgo.toISOString())).toBe('3일 전');
    });

    it('should return short date for 7+ days ago', () => {
      const tenDaysAgo = new Date('2025-01-05T12:00:00.000Z');
      const result = formatRelativeTime(tenDaysAgo.toISOString());
      expect(result).toMatch(/1월.*5일/);
    });
  });

  describe('formatShortDate', () => {
    it('should format date as month and day', () => {
      const result = formatShortDate('2025-01-15T12:00:00.000Z');
      expect(result).toMatch(/1월.*15일/);
    });

    it('should handle different months', () => {
      const result = formatShortDate('2025-12-25T12:00:00.000Z');
      expect(result).toMatch(/12월.*25일/);
    });
  });

  describe('formatFullDate', () => {
    it('should format date with year, month, and day', () => {
      const result = formatFullDate('2025-01-15T12:00:00.000Z');
      expect(result).toMatch(/2025년.*1월.*15일/);
    });
  });

  describe('formatCompactDate', () => {
    it('should format date in compact format', () => {
      const result = formatCompactDate('2025-01-15T12:00:00.000Z');
      // Korean compact format: 2025. 1. 15.
      expect(result).toMatch(/2025/);
      expect(result).toMatch(/1/);
      expect(result).toMatch(/15/);
    });
  });

  describe('formatMonthYear', () => {
    it('should format date as month and year', () => {
      const result = formatMonthYear('2025-01-15T12:00:00.000Z');
      expect(result).toMatch(/2025년.*1월/);
    });
  });

  describe('formatDateForInput', () => {
    it('should format date as YYYY-MM-DD', () => {
      const date = new RealDate('2025-01-15T12:00:00.000Z');
      // Note: This will be in local timezone
      const result = formatDateForInput(date);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should pad single digit months and days', () => {
      const date = new RealDate('2025-01-05T12:00:00.000Z');
      const result = formatDateForInput(date);
      expect(result).toMatch(/^\d{4}-01-\d{2}$/);
    });
  });

  describe('isSameDay', () => {
    it('should return true for same day', () => {
      // Use local dates to avoid timezone issues
      const date1 = new RealDate(2025, 0, 15, 10, 0, 0);
      const date2 = new RealDate(2025, 0, 15, 20, 0, 0);
      expect(isSameDay(date1, date2)).toBe(true);
    });

    it('should return false for different days', () => {
      const date1 = new RealDate(2025, 0, 15, 10, 0, 0);
      const date2 = new RealDate(2025, 0, 16, 10, 0, 0);
      expect(isSameDay(date1, date2)).toBe(false);
    });

    it('should return false for same day different month', () => {
      const date1 = new RealDate(2025, 0, 15, 10, 0, 0);
      const date2 = new RealDate(2025, 1, 15, 10, 0, 0);
      expect(isSameDay(date1, date2)).toBe(false);
    });
  });

  describe('daysUntil', () => {
    it('should return positive number for future dates', () => {
      const futureDate = '2025-01-20T12:00:00.000Z';
      expect(daysUntil(futureDate)).toBe(5);
    });

    it('should return 0 for today', () => {
      const today = '2025-01-15T12:00:00.000Z';
      expect(daysUntil(today)).toBe(0);
    });

    it('should return negative number for past dates', () => {
      const pastDate = '2025-01-10T12:00:00.000Z';
      expect(daysUntil(pastDate)).toBe(-5);
    });
  });

  describe('isWithinDays', () => {
    it('should return true for dates within range', () => {
      const futureDate = '2025-01-18T12:00:00.000Z'; // 3 days from now
      expect(isWithinDays(futureDate, 7)).toBe(true);
    });

    it('should return true for today', () => {
      const today = '2025-01-15T12:00:00.000Z';
      expect(isWithinDays(today, 7)).toBe(true);
    });

    it('should return false for dates beyond range', () => {
      const farFuture = '2025-01-30T12:00:00.000Z';
      expect(isWithinDays(farFuture, 7)).toBe(false);
    });

    it('should return false for past dates', () => {
      const pastDate = '2025-01-10T12:00:00.000Z';
      expect(isWithinDays(pastDate, 7)).toBe(false);
    });
  });

  describe('getTodayString', () => {
    it('should return today in YYYY-MM-DD format', () => {
      const result = getTodayString();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});
