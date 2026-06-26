/**
 * 检查响应是否成功
 */
export function isSuccessResponse(response: {
  code?: number;
  data?: { code?: number };
}): boolean {
  const code = response.code ?? response.data?.code;
  return code === 0 || code === 200 || code === undefined;
}

