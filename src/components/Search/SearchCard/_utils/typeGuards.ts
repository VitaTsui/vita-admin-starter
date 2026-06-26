/**
 * 类型守卫函数
 */
export const isValidValue = (value: unknown): boolean => {
  return value !== null && value !== undefined;
};

export const isArrayValue = (value: unknown): value is unknown[] => {
  return Array.isArray(value);
};

export const isStringValue = (value: unknown): value is string => {
  return typeof value === "string";
};

