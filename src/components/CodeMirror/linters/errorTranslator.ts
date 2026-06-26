/**
 * 将英文错误信息翻译成中文
 */
export function translateError(message: string): string {
  if (!message) return message;

  let translated = message;

  // 先处理完整的 JSON 错误模式（优先级最高）
  const jsonPatterns: Array<[RegExp, string]> = [
    [
      /Unexpected token (.+) in JSON at position (\d+)/gi,
      "JSON 中位置 $2 处意外的标记: $1",
    ],
    [/Unexpected end of JSON input/gi, "JSON 输入意外结束"],
    [
      /Expected property name or '}' in JSON at position (\d+)/gi,
      "JSON 中位置 $1 处期望属性名或 '}'",
    ],
    [
      /Expected double-quoted property name in JSON at position (\d+)/gi,
      "JSON 中位置 $1 处期望双引号属性名",
    ],
    [
      /Expected ':' after property name in JSON at position (\d+)/gi,
      "JSON 中位置 $1 处属性名后期望 ':'",
    ],
    [
      /Expected ',' or '}' after property value in JSON at position (\d+)/gi,
      "JSON 中位置 $1 处属性值后期望 ',' 或 '}'",
    ],
    [
      /Expected ',' or ']' after array element in JSON at position (\d+)/gi,
      "JSON 中位置 $1 处数组元素后期望 ',' 或 ']'",
    ],
    [
      /Unexpected non-whitespace character after JSON at position (\d+)/gi,
      "JSON 中位置 $1 处意外的非空白字符",
    ],
    [/Unexpected end of JSON input/gi, "JSON 输入意外结束"],
  ];

  // 应用 JSON 完整模式
  jsonPatterns?.forEach(([pattern, replacement]) => {
    translated = translated.replace(pattern, replacement);
  });

  // 处理位置信息（如果还没有被上面的模式处理）
  if (translated.includes("at position")) {
    const positionMatch = translated.match(/at position (\d+)/);
    if (positionMatch) {
      translated = translated.replace(
        /at position \d+/,
        `位置 ${positionMatch[1]}`
      );
    }
  }

  // 处理常见的单词翻译（按长度从长到短排序，优先匹配长短语）
  const wordTranslations: Array<[string, string]> = [
    ["but found", "但找到"],
    ["in JSON", "在 JSON 中"],
    ["at position", "位置"],
    ["after property", "属性后"],
    ["after array", "数组后"],
    ["property name", "属性名"],
    ["property value", "属性值"],
    ["array element", "数组元素"],
    ["non-whitespace character", "非空白字符"],
    ["double-quoted", "双引号"],
    ["Unexpected", "意外的"],
    ["Expected", "期望"],
    ["Invalid", "无效的"],
    ["Missing", "缺少"],
    ["Unknown", "未知的"],
    ["SyntaxError", "语法错误"],
    ["token", "标记"],
    ["column", "列"],
    ["table", "表"],
    ["keyword", "关键字"],
    ["operator", "操作符"],
    ["function", "函数"],
    ["syntax", "语法"],
    ["parse", "解析"],
    ["error", "错误"],
    ["end", "结束"],
    ["input", "输入"],
    ["character", "字符"],
    ["found", "找到"],
    ["but", "但是"],
  ];

  // 应用单词翻译（按顺序，长短语优先）
  wordTranslations?.forEach(([en, zh]) => {
    // 对于短语，直接替换
    if (en.includes(" ")) {
      const regex = new RegExp(en.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
      translated = translated.replace(regex, zh);
    } else {
      // 对于单词，使用单词边界
      const regex = new RegExp(
        `\\b${en.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
        "gi"
      );
      translated = translated.replace(regex, zh);
    }
  });

  // 处理常见的 SQL 错误模式
  const sqlPatterns: Array<[RegExp, string]> = [
    [/SyntaxError: (.+)/gi, "语法错误: $1"],
    [/Expected (.+) but found (.+)/gi, "期望 $1 但找到 $2"],
    [/Invalid (.+)/gi, "无效的 $1"],
    [/Missing (.+)/gi, "缺少 $1"],
    [/Unknown (.+)/gi, "未知的 $1"],
  ];

  sqlPatterns?.forEach(([pattern, replacement]) => {
    translated = translated.replace(pattern, replacement);
  });

  // 清理多余的空白字符和标点
  translated = translated
    .replace(/\s+/g, " ") // 多个空格合并为一个
    .replace(/\s*,\s*/g, "，") // 英文逗号改为中文逗号
    .replace(/\s*:\s*/g, "：") // 英文冒号改为中文冒号
    .replace(/\s*\.\s*/g, "。") // 英文句号改为中文句号
    .trim();

  // 最后检查：如果还有明显的英文单词残留，尝试翻译常见单词
  // 注意：这些单词可能已经在前面的翻译中被处理，这里作为兜底
  const commonEnglishWords: Array<[string, string]> = [
    ["or", "或"],
    ["and", "和"],
    ["of", "的"],
    ["with", "使用"],
    ["without", "没有"],
    ["for", "为"],
    ["from", "从"],
    ["by", "通过"],
    ["the", "该"],
    ["a", "一个"],
    ["an", "一个"],
    ["is", "是"],
    ["are", "是"],
    ["was", "是"],
    ["were", "是"],
    ["has", "有"],
    ["have", "有"],
    ["in", "在"],
    ["at", "在"],
    ["to", "到"],
  ];

  // 直接替换，不需要先检查（避免正则状态问题）
  commonEnglishWords?.forEach(([en, zh]) => {
    // 使用单词边界，确保只替换完整的单词
    const regex = new RegExp(`\\b${en}\\b`, "gi");
    translated = translated.replace(regex, zh);
  });

  // 最终清理：移除多余的空格
  translated = translated.replace(/\s+/g, " ").trim();

  return translated;
}
