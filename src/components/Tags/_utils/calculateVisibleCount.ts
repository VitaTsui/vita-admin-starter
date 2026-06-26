/**
 * 计算可见的标签数量
 * @param containerWidth 容器宽度
 * @param tagWidths 所有标签的宽度数组
 * @param gap 标签之间的间距
 * @param ellipsisTagWidth 省略标签的预估宽度
 * @returns 可见的标签数量
 */
export function calculateVisibleCount(
  containerWidth: number,
  tagWidths: number[],
  gap: number = 8,
  ellipsisTagWidth: number = 60
): number {
  if (containerWidth === 0 || tagWidths.length === 0) {
    return tagWidths.length;
  }

  let usedWidth = 0;
  let count = 0;

  // 遍历所有 tag，计算能显示多少个
  for (let i = 0; i < tagWidths.length; i++) {
    const tagWidth = tagWidths[i] || 0;
    // 计算加上当前 tag 后的总宽度
    const nextWidth = usedWidth + tagWidth + (i > 0 ? gap : 0);

    // 检查是否需要显示省略标签
    if (i < tagWidths.length - 1) {
      // 不是最后一个 tag，需要预留省略标签的空间
      if (nextWidth + gap + ellipsisTagWidth > containerWidth) {
        break;
      }
    } else {
      // 是最后一个 tag，只需要检查当前宽度
      if (nextWidth > containerWidth) {
        break;
      }
    }

    count++;
    usedWidth = nextWidth;
  }

  // 至少显示 0 个（如果连一个都放不下，就只显示省略标签）
  return Math.max(0, count);
}
