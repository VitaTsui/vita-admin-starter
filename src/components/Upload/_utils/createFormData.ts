/**
 * 创建 FormData 并添加数据
 */
export function createFormData(
  data?: Partial<Record<string, string>>
): FormData {
  const formData = new FormData();

  if (data) {
    Object.keys(data)?.forEach((key) => {
      const v = data[key];
      if (v) {
        formData.append(key, v);
      }
    });
  }

  return formData;
}
