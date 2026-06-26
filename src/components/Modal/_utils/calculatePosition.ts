/**
 * 计算模态框位置，考虑边界检测
 * @param left 目标左边距
 * @param top 目标上边距
 * @param modalWidth 模态框宽度
 * @param modalHeight 模态框高度
 * @param edgeDetection 是否启用边界检测
 * @returns 计算后的位置
 */
export function calculatePosition(
  left: number,
  top: number,
  modalWidth: number,
  modalHeight: number,
  edgeDetection: boolean
): { left: number; top: number } {
  if (!edgeDetection) {
    return { left, top };
  }

  let newLeft = left < 0 ? 0 : left;
  let newTop = top < 0 ? 0 : top;

  if (newLeft + modalWidth > window.innerWidth) {
    newLeft = window.innerWidth - modalWidth;
  }

  if (newTop + modalHeight > window.innerHeight) {
    newTop = window.innerHeight - modalHeight;
  }

  return { left: newLeft, top: newTop };
}

