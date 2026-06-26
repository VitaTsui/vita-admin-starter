import { FormItemProps } from "@/components/FormItem";

/**
 * 计算当前应该显示的搜索项
 * @param searchItems 所有搜索项
 * @param expand 是否展开
 * @param columnNum 列数
 * @param visibleItemCount 可见项数量（自适应宽度时使用）
 * @param autoAdaptWidth 是否启用自适应宽度
 * @param buttonGroupWidth 按钮组宽度（可选）
 * @param columnWidth 列宽（可选）
 * @returns 当前应该显示的搜索项
 */
export function calculateVisibleItems(
  searchItems: FormItemProps[],
  expand: boolean,
  columnNum: number,
  visibleItemCount: number,
  autoAdaptWidth: boolean,
  buttonGroupWidth?: number,
  columnWidth?: number,
): FormItemProps[] {
  const visibleItems = searchItems.filter((item) => item.visible);
  const hasCustomWidth = searchItems.find((item) => item.width !== undefined);

  if (!expand) {
    // 当有自定义宽度时，使用自适应计算
    if (hasCustomWidth && autoAdaptWidth) {
      if (visibleItems.length > visibleItemCount) {
        return visibleItems.slice(0, visibleItemCount);
      }
    } else if (!hasCustomWidth) {
      // 没有自定义宽度时，使用 columnNum（实际搜索项数量）
      // 判断按钮组宽度是否大于列宽，如果是，则显示 实际搜索项数量+1
      let displayCount = columnNum;
      if (
        buttonGroupWidth !== undefined &&
        columnWidth !== undefined &&
        (buttonGroupWidth > columnWidth ||
          (buttonGroupWidth < columnWidth &&
            columnNum + 1 === visibleItems.length))
      ) {
        displayCount = columnNum + 1;
      }
      if (visibleItems.length >= displayCount) {
        return visibleItems.slice(0, displayCount);
      }
    }
  }
  return visibleItems;
}
