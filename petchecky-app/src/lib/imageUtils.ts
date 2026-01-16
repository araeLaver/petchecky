/**
 * 이미지 처리 유틸리티
 * - WebP 변환
 * - 이미지 최적화
 */

import sharp from 'sharp';

export interface ImageData {
  data: string;
  mimeType: string;
}

export interface ConvertedImage {
  data: string;
  mimeType: 'image/webp';
  originalSize: number;
  convertedSize: number;
  compressionRatio: number;
}

/**
 * Base64 이미지를 WebP 형식으로 변환
 * - 품질 80%로 최적화
 * - 원본 크기와 변환 후 크기 비교 제공
 *
 * @param imageData - Base64 인코딩된 이미지 데이터와 MIME 타입
 * @returns WebP 형식으로 변환된 이미지 데이터
 *
 * @example
 * ```typescript
 * const converted = await convertToWebP({
 *   data: 'base64EncodedImageData...',
 *   mimeType: 'image/png'
 * });
 * console.log(`압축률: ${converted.compressionRatio}%`);
 * ```
 */
export async function convertToWebP(imageData: ImageData): Promise<ConvertedImage> {
  // Base64 디코딩
  const inputBuffer = Buffer.from(imageData.data, 'base64');
  const originalSize = inputBuffer.length;

  // WebP로 변환 (품질 80%)
  const webpBuffer = await sharp(inputBuffer)
    .webp({ quality: 80 })
    .toBuffer();

  const convertedSize = webpBuffer.length;

  // Base64로 다시 인코딩
  const webpBase64 = webpBuffer.toString('base64');

  return {
    data: webpBase64,
    mimeType: 'image/webp',
    originalSize,
    convertedSize,
    compressionRatio: Math.round((1 - convertedSize / originalSize) * 100),
  };
}

/**
 * 이미지가 WebP 변환이 필요한지 확인
 * - 이미 WebP인 경우 false
 * - GIF(애니메이션)인 경우 false (애니메이션 손실 방지)
 *
 * @param mimeType - 이미지 MIME 타입
 * @returns 변환 필요 여부
 */
export function shouldConvertToWebP(mimeType: string): boolean {
  // 이미 WebP이거나 GIF(애니메이션 가능성)인 경우 변환하지 않음
  const skipConversion = ['image/webp', 'image/gif'];
  return !skipConversion.includes(mimeType);
}

/**
 * 이미지 최적화 (WebP 변환 + 리사이즈)
 * - 최대 너비/높이 제한 (선택적)
 * - WebP 변환
 *
 * @param imageData - 원본 이미지 데이터
 * @param options - 최적화 옵션
 * @returns 최적화된 이미지
 */
export async function optimizeImage(
  imageData: ImageData,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  } = {}
): Promise<ConvertedImage> {
  const { maxWidth = 1920, maxHeight = 1920, quality = 80 } = options;

  const inputBuffer = Buffer.from(imageData.data, 'base64');
  const originalSize = inputBuffer.length;

  let pipeline = sharp(inputBuffer);

  // 리사이즈 (필요한 경우만)
  const metadata = await sharp(inputBuffer).metadata();
  if (metadata.width && metadata.height) {
    if (metadata.width > maxWidth || metadata.height > maxHeight) {
      pipeline = pipeline.resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }
  }

  // WebP 변환
  const webpBuffer = await pipeline.webp({ quality }).toBuffer();
  const convertedSize = webpBuffer.length;

  return {
    data: webpBuffer.toString('base64'),
    mimeType: 'image/webp',
    originalSize,
    convertedSize,
    compressionRatio: Math.round((1 - convertedSize / originalSize) * 100),
  };
}
