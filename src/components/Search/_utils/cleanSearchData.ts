/**
 * 清理搜索数据，移除 undefined 值
 * @param data 原始搜索数据
 * @returns 清理后的搜索数据
 */
export function cleanSearchData<T = Record<string, unknown>>(
  data: Record<string, unknown>
): Partial<T> | undefined {
  const cleaned: Record<string, unknown> = {};
  let hasValue = false;

  for (const key in data) {
    if (data[key] !== undefined) {
      cleaned[key] = data[key];
      hasValue = true;
    }
  }

  return hasValue ? (cleaned as Partial<T>) : undefined;
}

