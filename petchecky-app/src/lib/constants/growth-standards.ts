/**
 * WHO Child Growth Standards - LMS data for percentile calculation
 * Source: WHO Multicentre Growth Reference Study (2006)
 * Ages 0-60 months
 */

interface LMSData {
  month: number;
  L: number;
  M: number;
  S: number;
}

// Weight-for-age (kg) - Boys 0-60 months
export const WEIGHT_FOR_AGE_BOYS: LMSData[] = [
  { month: 0, L: 0.3487, M: 3.3464, S: 0.14602 },
  { month: 1, L: 0.2297, M: 4.4709, S: 0.13395 },
  { month: 2, L: 0.197, M: 5.5675, S: 0.12385 },
  { month: 3, L: 0.1738, M: 6.3762, S: 0.11727 },
  { month: 4, L: 0.1553, M: 7.0023, S: 0.11316 },
  { month: 5, L: 0.1395, M: 7.5105, S: 0.1108 },
  { month: 6, L: 0.1257, M: 7.934, S: 0.10958 },
  { month: 7, L: 0.1134, M: 8.297, S: 0.10902 },
  { month: 8, L: 0.1021, M: 8.6151, S: 0.10882 },
  { month: 9, L: 0.0917, M: 8.9014, S: 0.10881 },
  { month: 10, L: 0.082, M: 9.1649, S: 0.10891 },
  { month: 11, L: 0.073, M: 9.4122, S: 0.10906 },
  { month: 12, L: 0.0644, M: 9.6479, S: 0.10925 },
  { month: 15, L: 0.0407, M: 10.3002, S: 0.10949 },
  { month: 18, L: 0.0209, M: 10.9209, S: 0.10951 },
  { month: 21, L: 0.0042, M: 11.4876, S: 0.10934 },
  { month: 24, L: -0.0105, M: 12.0185, S: 0.10903 },
  { month: 30, L: -0.0356, M: 13.0306, S: 0.10813 },
  { month: 36, L: -0.0557, M: 14.002, S: 0.10718 },
  { month: 42, L: -0.0727, M: 14.9641, S: 0.1068 },
  { month: 48, L: -0.0871, M: 15.953, S: 0.10706 },
  { month: 54, L: -0.0997, M: 16.9807, S: 0.10797 },
  { month: 60, L: -0.1106, M: 18.0414, S: 0.10951 },
];

// Weight-for-age (kg) - Girls 0-60 months
export const WEIGHT_FOR_AGE_GIRLS: LMSData[] = [
  { month: 0, L: 0.3809, M: 3.2322, S: 0.14171 },
  { month: 1, L: 0.1714, M: 4.1873, S: 0.13724 },
  { month: 2, L: 0.0962, M: 5.1282, S: 0.13 },
  { month: 3, L: 0.0402, M: 5.8458, S: 0.12619 },
  { month: 4, L: -0.005, M: 6.4237, S: 0.12402 },
  { month: 5, L: -0.043, M: 6.8985, S: 0.12274 },
  { month: 6, L: -0.0756, M: 7.297, S: 0.12204 },
  { month: 7, L: -0.1039, M: 7.6422, S: 0.12169 },
  { month: 8, L: -0.1288, M: 7.9487, S: 0.12156 },
  { month: 9, L: -0.1507, M: 8.2254, S: 0.12155 },
  { month: 10, L: -0.17, M: 8.48, S: 0.12162 },
  { month: 11, L: -0.1872, M: 8.7192, S: 0.12173 },
  { month: 12, L: -0.2024, M: 8.9481, S: 0.12185 },
  { month: 15, L: -0.2375, M: 9.5918, S: 0.12206 },
  { month: 18, L: -0.2632, M: 10.2005, S: 0.12215 },
  { month: 21, L: -0.2826, M: 10.7693, S: 0.12214 },
  { month: 24, L: -0.2974, M: 11.3177, S: 0.12202 },
  { month: 30, L: -0.3175, M: 12.3721, S: 0.12148 },
  { month: 36, L: -0.3296, M: 13.4322, S: 0.12101 },
  { month: 42, L: -0.3355, M: 14.515, S: 0.12117 },
  { month: 48, L: -0.3372, M: 15.6393, S: 0.12207 },
  { month: 54, L: -0.3357, M: 16.8174, S: 0.12369 },
  { month: 60, L: -0.332, M: 18.0573, S: 0.12599 },
];

// Height/Length-for-age (cm) - Boys 0-60 months
export const HEIGHT_FOR_AGE_BOYS: LMSData[] = [
  { month: 0, L: 1, M: 49.8842, S: 0.03795 },
  { month: 1, L: 1, M: 54.7244, S: 0.03557 },
  { month: 2, L: 1, M: 58.4249, S: 0.03424 },
  { month: 3, L: 1, M: 61.4292, S: 0.03328 },
  { month: 4, L: 1, M: 63.886, S: 0.03257 },
  { month: 5, L: 1, M: 65.9026, S: 0.03204 },
  { month: 6, L: 1, M: 67.6236, S: 0.03165 },
  { month: 7, L: 1, M: 69.1645, S: 0.03139 },
  { month: 8, L: 1, M: 70.5994, S: 0.03124 },
  { month: 9, L: 1, M: 71.9687, S: 0.03117 },
  { month: 10, L: 1, M: 73.2812, S: 0.03118 },
  { month: 11, L: 1, M: 74.5388, S: 0.03125 },
  { month: 12, L: 1, M: 75.7488, S: 0.03137 },
  { month: 15, L: 1, M: 79.295, S: 0.0318 },
  { month: 18, L: 1, M: 82.4467, S: 0.03231 },
  { month: 21, L: 1, M: 85.1882, S: 0.03276 },
  { month: 24, L: 1, M: 87.1161, S: 0.03314 },
  { month: 30, L: 1, M: 91.9132, S: 0.03374 },
  { month: 36, L: 1, M: 96.0836, S: 0.0342 },
  { month: 42, L: 1, M: 99.8228, S: 0.03458 },
  { month: 48, L: 1, M: 103.3, S: 0.03495 },
  { month: 54, L: 1, M: 106.5916, S: 0.03533 },
  { month: 60, L: 1, M: 109.7869, S: 0.03576 },
];

// Height/Length-for-age (cm) - Girls 0-60 months
export const HEIGHT_FOR_AGE_GIRLS: LMSData[] = [
  { month: 0, L: 1, M: 49.1477, S: 0.0379 },
  { month: 1, L: 1, M: 53.6872, S: 0.0364 },
  { month: 2, L: 1, M: 57.0673, S: 0.03568 },
  { month: 3, L: 1, M: 59.8029, S: 0.0352 },
  { month: 4, L: 1, M: 62.0899, S: 0.03486 },
  { month: 5, L: 1, M: 64.0301, S: 0.03463 },
  { month: 6, L: 1, M: 65.7311, S: 0.03448 },
  { month: 7, L: 1, M: 67.2873, S: 0.03441 },
  { month: 8, L: 1, M: 68.7498, S: 0.0344 },
  { month: 9, L: 1, M: 70.1435, S: 0.03444 },
  { month: 10, L: 1, M: 71.4818, S: 0.03452 },
  { month: 11, L: 1, M: 72.771, S: 0.03464 },
  { month: 12, L: 1, M: 74.015, S: 0.03479 },
  { month: 15, L: 1, M: 77.5049, S: 0.03529 },
  { month: 18, L: 1, M: 80.7128, S: 0.03583 },
  { month: 21, L: 1, M: 83.6165, S: 0.03629 },
  { month: 24, L: 1, M: 85.7153, S: 0.03667 },
  { month: 30, L: 1, M: 90.6625, S: 0.0372 },
  { month: 36, L: 1, M: 95.0754, S: 0.03756 },
  { month: 42, L: 1, M: 99.1359, S: 0.03787 },
  { month: 48, L: 1, M: 102.9518, S: 0.03822 },
  { month: 54, L: 1, M: 106.6105, S: 0.03866 },
  { month: 60, L: 1, M: 110.1641, S: 0.03919 },
];

// Head circumference-for-age (cm) - Boys 0-60 months
export const HEAD_CIRC_BOYS: LMSData[] = [
  { month: 0, L: 1, M: 34.4618, S: 0.03686 },
  { month: 1, L: 1, M: 37.2759, S: 0.03133 },
  { month: 2, L: 1, M: 39.1285, S: 0.02997 },
  { month: 3, L: 1, M: 40.5135, S: 0.02918 },
  { month: 4, L: 1, M: 41.6317, S: 0.02868 },
  { month: 5, L: 1, M: 42.5576, S: 0.02837 },
  { month: 6, L: 1, M: 43.3306, S: 0.02817 },
  { month: 9, L: 1, M: 45.1944, S: 0.02796 },
  { month: 12, L: 1, M: 46.4864, S: 0.02813 },
  { month: 18, L: 1, M: 48.0089, S: 0.02876 },
  { month: 24, L: 1, M: 49.0027, S: 0.02949 },
  { month: 36, L: 1, M: 50.1825, S: 0.03049 },
  { month: 48, L: 1, M: 50.9432, S: 0.03098 },
  { month: 60, L: 1, M: 51.4735, S: 0.03123 },
];

// Head circumference-for-age (cm) - Girls 0-60 months
export const HEAD_CIRC_GIRLS: LMSData[] = [
  { month: 0, L: 1, M: 33.8787, S: 0.03496 },
  { month: 1, L: 1, M: 36.5463, S: 0.03078 },
  { month: 2, L: 1, M: 38.2521, S: 0.02966 },
  { month: 3, L: 1, M: 39.5328, S: 0.02903 },
  { month: 4, L: 1, M: 40.5817, S: 0.02868 },
  { month: 5, L: 1, M: 41.459, S: 0.02849 },
  { month: 6, L: 1, M: 42.1995, S: 0.02838 },
  { month: 9, L: 1, M: 43.9784, S: 0.02834 },
  { month: 12, L: 1, M: 45.2299, S: 0.02858 },
  { month: 18, L: 1, M: 46.7688, S: 0.02927 },
  { month: 24, L: 1, M: 47.8016, S: 0.02997 },
  { month: 36, L: 1, M: 49.0505, S: 0.03088 },
  { month: 48, L: 1, M: 49.8867, S: 0.03132 },
  { month: 60, L: 1, M: 50.4685, S: 0.03154 },
];

/**
 * Calculate Z-score from LMS parameters
 */
export function calculateZScore(value: number, L: number, M: number, S: number): number {
  if (L === 0) {
    return Math.log(value / M) / S;
  }
  return (Math.pow(value / M, L) - 1) / (L * S);
}

/**
 * Convert Z-score to percentile
 */
export function zScoreToPercentile(z: number): number {
  // Approximation using cumulative normal distribution
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = z < 0 ? -1 : 1;
  const absZ = Math.abs(z) / Math.sqrt(2);
  const t = 1.0 / (1.0 + p * absZ);
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absZ * absZ);

  return Math.round((0.5 * (1.0 + sign * y)) * 1000) / 10;
}

/**
 * Interpolate LMS data for a given age in months
 */
export function interpolateLMS(data: LMSData[], ageMonths: number): LMSData | null {
  if (data.length === 0) return null;

  // Exact match
  const exact = data.find((d) => d.month === ageMonths);
  if (exact) return exact;

  // Find surrounding points
  let lower: LMSData | null = null;
  let upper: LMSData | null = null;

  for (let i = 0; i < data.length; i++) {
    if (data[i].month <= ageMonths) lower = data[i];
    if (data[i].month >= ageMonths && !upper) upper = data[i];
  }

  if (!lower && upper) return upper;
  if (lower && !upper) return lower;
  if (!lower || !upper) return null;
  if (lower.month === upper.month) return lower;

  // Linear interpolation
  const ratio = (ageMonths - lower.month) / (upper.month - lower.month);
  return {
    month: ageMonths,
    L: lower.L + ratio * (upper.L - lower.L),
    M: lower.M + ratio * (upper.M - lower.M),
    S: lower.S + ratio * (upper.S - lower.S),
  };
}

/**
 * Get percentile for a given measurement
 */
export function getPercentile(
  data: LMSData[],
  ageMonths: number,
  value: number
): number | null {
  const lms = interpolateLMS(data, ageMonths);
  if (!lms) return null;

  const z = calculateZScore(value, lms.L, lms.M, lms.S);
  return zScoreToPercentile(z);
}

/**
 * Generate percentile curve data points (3rd, 15th, 50th, 85th, 97th)
 */
export function generatePercentileCurves(
  data: LMSData[],
  percentiles: number[] = [3, 15, 50, 85, 97]
): { month: number; values: Record<string, number> }[] {
  const zScores: Record<number, number> = {
    3: -1.88,
    15: -1.04,
    50: 0,
    85: 1.04,
    97: 1.88,
  };

  return data.map((d) => {
    const values: Record<string, number> = {};
    for (const p of percentiles) {
      const z = zScores[p] || 0;
      if (d.L === 0) {
        values[`p${p}`] = d.M * Math.exp(d.S * z);
      } else {
        values[`p${p}`] = d.M * Math.pow(1 + d.L * d.S * z, 1 / d.L);
      }
      values[`p${p}`] = Math.round(values[`p${p}`] * 100) / 100;
    }
    return { month: d.month, values };
  });
}
