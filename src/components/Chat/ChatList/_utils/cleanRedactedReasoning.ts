/**
 * 清理 redacted_reasoning 标签
 * @param text 需要清理的文本
 * @returns 清理后的文本
 */
export function cleanRedactedReasoning(text: string): string {
  if (!text) return "";
  return text
    .replace("<think>", "")
    .replace("</think>", "")
    .trim();
}

