/**
 * Formatters and Numerical Utilities for Learnova AI
 * Ensures all numbers, percentages, and score representations are formatted cleanly,
 * predictably, and safely across the entire application without NaN, null, or flicker.
 */

/**
 * Parses any value (string, number) into structured parts:
 * prefix, target number, suffix, decimal precision, and numeric validity.
 *
 * Examples:
 *   "75%"     -> { isNumeric: true, prefix: "", target: 75, suffix: "%", decimals: 0 }
 *   "+12%"    -> { isNumeric: true, prefix: "+", target: 12, suffix: "%", decimals: 0 }
 *   "3 / 6"   -> { isNumeric: true, prefix: "", target: 3, suffix: " / 6", decimals: 0 }
 *   "92.4%"   -> { isNumeric: true, prefix: "", target: 92.4, suffix: "%", decimals: 1 }
 *   "1 Days"  -> { isNumeric: true, prefix: "", target: 1, suffix: " Days", decimals: 0 }
 *   "6+"      -> { isNumeric: true, prefix: "", target: 6, suffix: "+", decimals: 0 }
 *   "< 24ms"  -> { isNumeric: true, prefix: "< ", target: 24, suffix: "ms", decimals: 0 }
 *   null      -> { isNumeric: false, prefix: "", target: 0, suffix: "", decimals: 0 }
 */
export const parseNumericValue = (val) => {
  if (val === null || val === undefined || val === '') {
    return {
      isNumeric: false,
      prefix: '',
      target: 0,
      suffix: '',
      decimals: 0,
      raw: '0'
    };
  }

  // If already a finite number
  if (typeof val === 'number') {
    if (isNaN(val) || !isFinite(val)) {
      return { isNumeric: false, prefix: '', target: 0, suffix: '', decimals: 0, raw: '0' };
    }
    const numStr = String(val);
    const decimals = numStr.includes('.') ? numStr.split('.')[1].length : 0;
    return {
      isNumeric: true,
      prefix: '',
      target: val,
      suffix: '',
      decimals,
      raw: numStr
    };
  }

  const str = String(val).trim();
  const match = str.match(/^([^\d]*)(\d+(?:\.\d+)?)(.*)$/);

  if (!match) {
    return {
      isNumeric: false,
      prefix: '',
      target: 0,
      suffix: '',
      decimals: 0,
      raw: str
    };
  }

  const prefix = match[1];
  const numStr = match[2];
  const suffix = match[3];
  const target = parseFloat(numStr);
  const decimals = numStr.includes('.') ? numStr.split('.')[1].length : 0;

  return {
    isNumeric: !isNaN(target) && isFinite(target),
    prefix,
    target: isNaN(target) ? 0 : target,
    suffix,
    decimals,
    raw: str
  };
};

/**
 * Formats a value as a percentage string (e.g., 75 -> "75%").
 * Handles null, undefined, strings with existing "%", and decimal precision.
 */
export const formatPercentage = (val, decimals = 0) => {
  if (val === null || val === undefined) return '0%';
  if (typeof val === 'string' && val.endsWith('%')) {
    const num = parseFloat(val);
    if (isNaN(num)) return val;
    return decimals > 0 ? `${num.toFixed(decimals)}%` : `${Math.round(num)}%`;
  }
  const num = typeof val === 'number' ? val : parseFloat(val);
  if (isNaN(num)) return '0%';
  return decimals > 0 ? `${num.toFixed(decimals)}%` : `${Math.round(num)}%`;
};

/**
 * Clamps a percentage value safely between min and max (default 0 and 100).
 */
export const clampPercentage = (val, min = 0, max = 100) => {
  const num = typeof val === 'number' ? val : parseFloat(val);
  if (isNaN(num)) return min;
  return Math.min(max, Math.max(min, num));
};

/**
 * Formats a ratio / score e.g. (3, 6) -> "3 / 6"
 */
export const formatScore = (score, total) => {
  const s = Math.round(Number(score) || 0);
  const t = Math.round(Number(total) || 0);
  return `${s} / ${t}`;
};

/**
 * Formats a number with locale commas e.g. 12500 -> "12,500"
 */
export const formatNumber = (val, decimals = 0) => {
  const num = typeof val === 'number' ? val : parseFloat(val);
  if (isNaN(num)) return '0';
  return num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};
