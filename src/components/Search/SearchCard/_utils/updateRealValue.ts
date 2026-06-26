import { isStringValue } from "./typeGuards";
import { hasSelectedChildren } from "./hasSelectedChildren";

/**
 * 更新真实返回值
 */
export function updateRealValue(
  value: Record<string, unknown>,
  optionName: string,
  newValues: Record<string, unknown>
): void {
  // 参数验证
  if (!value || !isStringValue(optionName) || !newValues) {
    return;
  }

  // 合并当前值和新值以获取最新状态
  const mergedValues = { ...value, ...newValues };

  // 检查是否存在子项数据
  let hasAnyChildrenSelected = false;
  let childrenValue: unknown = null;

  // 遍历所有可能的子项名称
  Object.keys(mergedValues)?.forEach((key) => {
    if (key.endsWith("Children")) {
      // 找到对应的父项名称
      const parentName = key.replace("Children", "");

      // 只处理当前选项的子项
      if (parentName === optionName) {
        try {
          // 检查子项是否有选中值
          const currentChildrenValue = mergedValues[key];
          const hasSelected = hasSelectedChildren(
            mergedValues,
            key,
            Array.isArray(currentChildrenValue)
          );

          if (hasSelected) {
            hasAnyChildrenSelected = true;
            childrenValue = currentChildrenValue;
          }
        } catch {
          void 0;
        }
      }
    }
  });

  // 设置真实返回值
  const realValueKey = `${optionName}Real`;
  if (hasAnyChildrenSelected) {
    // 如果有子项被选中，使用子项值
    newValues[realValueKey] = childrenValue;
  } else {
    // 如果没有子项被选中，使用父项值
    const parentValue = newValues[optionName] ?? value[optionName];
    newValues[realValueKey] = parentValue;
  }
}
