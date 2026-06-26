/**
 * 计算合适的Y轴范围和间隔，确保0是刻度点，且总刻度数固定为6个
 * @param min 最小值
 * @param max 最大值
 * @returns { min, max, interval } Y轴配置
 */
export function calculateAxisConfig(
  min: number,
  max: number
): { min: number; max: number; interval: number } {
  // 根据数值大小选择合适的取整基数
  const getNiceNumber = (value: number) => {
    if (value === 0) return 1;
    const magnitude = Math.pow(10, Math.floor(Math.log10(Math.abs(value))));
    const normalized = value / magnitude;

    // 选择 1, 2, 5, 10 这样的"整齐"数字
    let niceNormalized: number;
    if (normalized <= 1) niceNormalized = 1;
    else if (normalized <= 2) niceNormalized = 2;
    else if (normalized <= 5) niceNormalized = 5;
    else niceNormalized = 10;

    return niceNormalized * magnitude;
  };

  // 处理无效数据
  if (min === Number.POSITIVE_INFINITY || max === Number.NEGATIVE_INFINITY) {
    return { min: 0, max: 5, interval: 1 };
  }

  // 如果数据全部为0，返回默认值（6个刻度：0,1,2,3,4,5）
  if (min === 0 && max === 0) {
    return { min: 0, max: 5, interval: 1 };
  }

  // 如果数据跨越0（有正有负）
  if (min < 0 && max > 0) {
    const absMax = Math.abs(max * 1.1);
    const absMin = Math.abs(min * 1.1);

    // 计算总范围，分成5个间隔（6个刻度）
    const totalRange = absMax + absMin;
    const roughInterval = totalRange / 5;
    const interval = getNiceNumber(roughInterval);

    // 计算需要多少个刻度能覆盖正负数据
    const negativeSteps = Math.ceil(absMin / interval);
    const positiveSteps = Math.ceil(absMax / interval);
    const totalSteps = negativeSteps + positiveSteps; // 不包括0

    // 如果总刻度数正好是6个（5个间隔+0）
    if (totalSteps === 5) {
      return {
        min: -negativeSteps * interval,
        max: positiveSteps * interval,
        interval,
      };
    }

    // 否则，调整为固定5个间隔，按比例分配正负两边
    const ratio = absMax / (absMax + absMin);
    const positiveIntervals = Math.round(ratio * 5);
    const negativeIntervals = 5 - positiveIntervals;

    return {
      min: -negativeIntervals * interval,
      max: positiveIntervals * interval,
      interval,
    };
  }

  // 如果全是非负数（固定6个刻度：0到max，分5段）
  if (min >= 0) {
    const roughMax = max * 1.1;
    const roughInterval = roughMax / 5;
    const interval = getNiceNumber(roughInterval);

    return {
      min: 0,
      max: interval * 5,
      interval,
    };
  }

  // 如果全是负数（固定6个刻度：min到0，分5段）
  const roughMin = Math.abs(min * 1.1);
  const roughInterval = roughMin / 5;
  const interval = getNiceNumber(roughInterval);

  return {
    min: -interval * 5,
    max: 0,
    interval,
  };
}
