import { convertToWebP, shouldConvertToWebP, optimizeImage } from '../imageUtils';

// sharp 모킹
jest.mock('sharp', () => {
  const mockSharp = jest.fn(() => ({
    webp: jest.fn().mockReturnThis(),
    resize: jest.fn().mockReturnThis(),
    metadata: jest.fn().mockResolvedValue({ width: 800, height: 600 }),
    toBuffer: jest.fn().mockResolvedValue(Buffer.from('mock-webp-data')),
  }));
  return mockSharp;
});

describe('imageUtils', () => {
  describe('shouldConvertToWebP', () => {
    it('PNG 이미지는 변환 필요', () => {
      expect(shouldConvertToWebP('image/png')).toBe(true);
    });

    it('JPEG 이미지는 변환 필요', () => {
      expect(shouldConvertToWebP('image/jpeg')).toBe(true);
    });

    it('WebP 이미지는 변환 불필요', () => {
      expect(shouldConvertToWebP('image/webp')).toBe(false);
    });

    it('GIF 이미지는 변환 불필요 (애니메이션 보존)', () => {
      expect(shouldConvertToWebP('image/gif')).toBe(false);
    });
  });

  describe('convertToWebP', () => {
    it('이미지를 WebP로 변환함', async () => {
      const inputData = Buffer.from('test-image-data').toString('base64');
      const result = await convertToWebP({
        data: inputData,
        mimeType: 'image/png',
      });

      expect(result.mimeType).toBe('image/webp');
      expect(result.data).toBeTruthy();
      expect(result.originalSize).toBeGreaterThan(0);
      expect(result.convertedSize).toBeGreaterThan(0);
      expect(typeof result.compressionRatio).toBe('number');
    });

    it('압축률을 올바르게 계산함', async () => {
      const inputData = Buffer.from('test-image-data-that-is-longer').toString('base64');
      const result = await convertToWebP({
        data: inputData,
        mimeType: 'image/jpeg',
      });

      // 압축률이 -100%~100% 범위 내인지 확인
      expect(result.compressionRatio).toBeGreaterThanOrEqual(-100);
      expect(result.compressionRatio).toBeLessThanOrEqual(100);
    });
  });

  describe('optimizeImage', () => {
    it('이미지를 최적화하고 WebP로 변환함', async () => {
      const inputData = Buffer.from('test-image-data').toString('base64');
      const result = await optimizeImage({
        data: inputData,
        mimeType: 'image/png',
      });

      expect(result.mimeType).toBe('image/webp');
      expect(result.data).toBeTruthy();
    });

    it('커스텀 옵션을 적용함', async () => {
      const inputData = Buffer.from('test-image-data').toString('base64');
      const result = await optimizeImage(
        {
          data: inputData,
          mimeType: 'image/png',
        },
        {
          maxWidth: 800,
          maxHeight: 600,
          quality: 75,
        }
      );

      expect(result.mimeType).toBe('image/webp');
    });
  });
});
