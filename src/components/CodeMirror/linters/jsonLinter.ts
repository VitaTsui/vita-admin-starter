import { EditorView } from "@codemirror/view";
import { Diagnostic } from "@codemirror/lint";
import { translateError } from "./errorTranslator";

// 全局 JSON 解析器实例
let jsonParser: { parse: (text: string) => unknown } | null = null;

// 预加载 JSON 解析器
const loadJsonParser = async () => {
  if (!jsonParser) {
    try {
      const { parse } = await import("comment-json");
      jsonParser = { parse };
    } catch {
      void 0;
    }
  }
  return jsonParser;
};

export interface JsonLinterOptions {
  /** 是否翻译错误信息为中文 */
  translate?: boolean;
  /**
   * 是否允许根节点为 JSON 数组 `[...]`（仅影响顶层字符校验，默认 false 仅允许 `{...}`）
   */
  allowArrayRoot?: boolean;
}

function resolveJsonLinterOptions(
  options: JsonLinterOptions | boolean = false,
): { translate: boolean; allowArrayRoot: boolean } {
  if (typeof options === "boolean") {
    return { translate: options, allowArrayRoot: false };
  }
  return {
    translate: options.translate ?? false,
    allowArrayRoot: options.allowArrayRoot ?? false,
  };
}

// JSON 语法检查器（可传 `boolean` 表示仅开启 translate，兼容旧用法）
export function jsonLinter(options: JsonLinterOptions | boolean = false) {
  const { translate, allowArrayRoot } = resolveJsonLinterOptions(options);

  return (view: EditorView) => {
    const diagnostics: Diagnostic[] = [];
    const text = view.state.doc.toString();

    if (!text.trim()) {
      return diagnostics;
    }

    // 默认必须以 `{` 开头；开启 allowArrayRoot 时亦允许 `[`
    const trimmedStart = text.trimStart();
    const rootOk =
      trimmedStart.startsWith("{") ||
      (allowArrayRoot && trimmedStart.startsWith("["));

    if (!rootOk) {
      const firstNonSpaceIndex = text.search(/\S/);
      const from = firstNonSpaceIndex === -1 ? 0 : firstNonSpaceIndex;
      const to = Math.min(from + 1, text.length);

      diagnostics.push({
        from,
        to,
        severity: "error",
        message: "请输入 JSON 格式",
      });

      return diagnostics;
    }

    if (jsonParser) {
      try {
        jsonParser.parse(text);
      } catch (e: unknown) {
        const error = e as Error;
        const message = error.message;

        // 尝试从错误消息中提取位置信息
        let from = 0;
        let to = text.length;

        // 解析位置信息，例如 "Unexpected token } in JSON at position 10"
        const positionMatch = message.match(/at position (\d+)/);
        if (positionMatch) {
          const position = parseInt(positionMatch[1], 10);
          from = Math.max(0, position - 1);
          to = Math.min(text.length, position + 1);
        }

        // 根据 translate 参数决定是否翻译错误信息
        const finalMessage = translate ? translateError(message) : message;

        diagnostics.push({
          from,
          to,
          severity: "error",
          message: finalMessage,
        });
      }
    } else {
      // 如果解析器还未加载，尝试加载
      loadJsonParser().then((parser) => {
        if (parser) {
          try {
            parser.parse(text);
          } catch {
            void 0;
          }
        }
      });
    }

    return diagnostics;
  };
}

// 导出预加载函数，供外部使用
export { loadJsonParser };
