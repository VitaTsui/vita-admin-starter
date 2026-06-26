import { isArrayValue, isValidValue } from "./typeGuards";

/**
 * 检查是否有任何子项被选中
 */
export function hasSelectedChildren(
  value: Record<string, unknown>,
  childrenName: string,
  isMultiple: boolean
): boolean {
  const childrenValue = value[childrenName];

  if (isMultiple) {
    // 多选模式：检查是否为数组且长度大于0
    return isArrayValue(childrenValue) && childrenValue.length > 0;
  } else {
    // 单选模式：检查值是否存在且不为空字符串
    return isValidValue(childrenValue) && childrenValue !== "";
  }
}

