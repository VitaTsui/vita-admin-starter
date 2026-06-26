/**
 * 获取相同值的连续行数
 * @param record 当前行数据
 * @param index 当前行索引
 * @param dataSource 数据源
 * @param key 相同值的key
 * @returns 相同值的连续行数
 */
export function getDepartmentRowSpan<T extends Record<string, unknown>>(
  record: T,
  index: number,
  dataSource: T[],
  key: string
) {
  const current = record[key];

  // 如果不是该值的第一行，返回0（不显示）
  if (index > 0 && dataSource[index - 1][key] === current) {
    return 0;
  }

  // 计算相同值的连续行数
  let count = 1;
  for (let i = index + 1; i < dataSource.length; i++) {
    if (dataSource[i][key] === current) {
      count++;
    } else {
      break;
    }
  }

  return count;
}

/**
 * Tooltip 配置常量
 */
export const HELP_TOOLTIP_CONFIG = {
  arrow: false,
  placement: "top" as const,
  color: "#f2f4f5",
  styles: { body: { color: "#131212", padding: "6px 16px" } },
};
