import { SearchCardOption } from "../_components/OptionRow";

/**
 * 获取真实值（提取所有Real值）
 */
export function getRealValues(
  value: Record<string, unknown>,
  options: SearchCardOption[],
  searchField: string
): Record<string, unknown> {
  const realValues: Record<string, unknown> = {};

  // 遍历所有选项，获取其Real值
  options?.forEach((option) => {
    const realKey = `${option.name}Real`;
    if (value[realKey] !== undefined) {
      // 将带有"Real"后缀的值使用不带后缀的原始键名
      realValues[option.name] = value[realKey];
    } else {
      // 如果没有Real值，使用原始值
      realValues[option.name] = value[option.name];
    }
  });

  // 保留搜索相关字段
  if (value[searchField] !== undefined) {
    realValues[searchField] = value[searchField];
  }

  return realValues;
}
