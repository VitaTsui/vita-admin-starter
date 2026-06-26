/**
 * 获取元素相对于文档的顶部位置
 */
export function getElementTop(element: HTMLDivElement): number {
  const rect = element.getBoundingClientRect();
  return rect.top + document.documentElement.scrollTop;
}

/**
 * 获取元素相对于文档的左侧位置
 */
export function getElementLeft(element: HTMLDivElement): number {
  const rect = element.getBoundingClientRect();
  return rect.left + document.documentElement.scrollLeft;
}

