/**
 * 大屏 Y 轴：按「万 / 亿」或 MB/GB/TB 换算时，要求刻度步长换算后 ≥ 1，
 * 避免出现 0.2 万、0.5GB 等小于 1 的刻度文案。
 */

export const MB_PER_GB = 1024;
export const MB_PER_TB = 1024 * 1024;

export function trimAxisNumber(n: number): string {
  if (Number.isInteger(n)) return String(n);
  const s = n.toFixed(2).replace(/\.?0+$/, "");
  return s === "" || s === "-" ? "0" : s;
}

/** 中文量级：仅当最大值与刻度间隔都达到该量级时才用「万」「亿」缩放 */
export function chineseMagnitudeDivisor(
  max: number,
  interval: number,
): 1 | 10_000 | 100_000_000 {
  const m = Number.isFinite(max) ? max : 0;
  const iv = Number.isFinite(interval) ? interval : 0;
  if (m >= 1e8 && iv >= 1e8) return 100_000_000;
  if (m >= 1e4 && iv >= 1e4) return 10_000;
  return 1;
}

export function formatChineseMagnitudeTick(
  value: number,
  max: number,
  interval: number,
): string {
  const v = Number(value);
  if (v === 0) return "0";
  const div = chineseMagnitudeDivisor(max, interval);
  if (div === 1) return trimAxisNumber(v);
  return trimAxisNumber(v / div);
}

/** MB 进位：仅当最大值与刻度间隔在该单位下均 ≥ 1 时才升到 GB/TB */
export function mbDisplayTier(
  maxMb: number,
  intervalMb: number,
): "MB" | "GB" | "TB" {
  const m = Number.isFinite(maxMb) ? maxMb : 0;
  const iv = Number.isFinite(intervalMb) ? intervalMb : 0;
  if (m >= MB_PER_TB && iv >= MB_PER_TB) return "TB";
  if (m >= MB_PER_GB && iv >= MB_PER_GB) return "GB";
  return "MB";
}

export function formatMbAxisTick(
  value: number,
  maxMb: number,
  intervalMb: number,
): string {
  const v = Number(value);
  if (v === 0) return "0";
  const tier = mbDisplayTier(maxMb, intervalMb);
  if (tier === "TB") return trimAxisNumber(v / MB_PER_TB);
  if (tier === "GB") return trimAxisNumber(v / MB_PER_GB);
  return trimAxisNumber(v);
}
