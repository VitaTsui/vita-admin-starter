import { RefObject } from "react";

/**
 * 计算按钮组宽度和列宽
 * @param containerRef 容器引用
 * @param buttonGroupRef 按钮组引用
 * @param adaptiveColumnNum 自适应列数
 * @param columnOffsetWidth 列偏移宽度（默认 0）
 * @returns 按钮组宽度和列宽
 */
export function calculateButtonGroupAndColumnWidth(
  containerRef: RefObject<HTMLDivElement>,
  buttonGroupRef: RefObject<HTMLDivElement>,
  adaptiveColumnNum: number,
  columnOffsetWidth: number = 0
): {
  buttonGroupWidth: number | undefined;
  columnWidth: number | undefined;
} {
  let buttonGroupWidth: number | undefined;
  let columnWidth: number | undefined;

  if (containerRef.current && buttonGroupRef.current) {
    const containerWidth = containerRef.current.offsetWidth;
    const availableWidth = containerWidth - 30; // 减去padding
    const gap = 10; // 项之间的间距

    // 计算按钮组宽度
    const buttonChildren = Array.from(buttonGroupRef.current.children);
    if (buttonChildren.length > 0) {
      let totalWidth = 0;
      buttonChildren?.forEach((child) => {
        totalWidth += (child as HTMLElement).offsetWidth;
      });
      const childGap = 5;
      totalWidth += (buttonChildren.length - 1) * childGap;
      buttonGroupWidth = totalWidth;
    }

    // 计算列宽（单个搜索项的默认宽度）
    if (adaptiveColumnNum > 0) {
      columnWidth =
        availableWidth -
        (((availableWidth - adaptiveColumnNum * gap) / (adaptiveColumnNum + 1) -
          columnOffsetWidth) *
          adaptiveColumnNum +
          adaptiveColumnNum * gap);
    }

    if (
      buttonGroupWidth !== undefined &&
      columnWidth !== undefined &&
      buttonGroupWidth > columnWidth
    ) {
      containerRef.current.style.setProperty(
        "--column-compensate-width",
        `${columnOffsetWidth}px`
      );
    } else {
      containerRef.current.style.setProperty(
        "--column-compensate-width",
        `${0}px`
      );
    }
  }

  return { buttonGroupWidth, columnWidth };
}
