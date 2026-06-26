/**
 * 根据索引获取标签颜色
 * @param index 标签索引
 * @param colors 颜色数组
 * @returns 颜色值或 undefined
 */
export function getTagColor(
  index: number,
  colors?: string[]
): string | undefined {
  if (colors && colors.length > 0) {
    return colors[index % colors.length];
  }
  return undefined;
}
