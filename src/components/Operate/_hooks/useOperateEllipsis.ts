import { useMemo } from "react";
import { OperateProps } from "../index";

/**
 * 计算操作按钮是否超出显示范围
 * @param menu - 菜单项数组
 * @param maxVisible - 最大可见数量
 * @param enableEllipsis - 是否启用省略
 * @returns 是否超出
 */
const useOperateEllipsis = (
  menu: OperateProps[],
  maxVisible?: number,
  enableEllipsis: boolean = true
): boolean => {
  return useMemo(() => {
    if (!enableEllipsis || maxVisible === undefined) {
      return false;
    }
    return menu.length > maxVisible;
  }, [menu.length, maxVisible, enableEllipsis]);
};

export default useOperateEllipsis;

