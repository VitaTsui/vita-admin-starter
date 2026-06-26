import { EditorView } from "@codemirror/view";
import { Diagnostic } from "@codemirror/lint";
import { translateError } from "./errorTranslator";

// 全局 SQL 解析器实例
let sqlParser: { astify: (sql: string) => unknown } | null = null;

// MongoDB 解析器函数类型
type MongoParser = (query: string) => unknown;

let mongoParser: MongoParser | null = null;

// 预加载 SQL 解析器
const loadSqlParser = async () => {
  if (!sqlParser) {
    try {
      const { Parser } = await import("node-sql-parser");
      sqlParser = new Parser();
    } catch {
      void 0;
    }
  }
  return sqlParser;
};

// 预加载 MongoDB 解析器
const loadMongoParser = async () => {
  if (!mongoParser) {
    try {
      const mongoQueryParser = await import("mongodb-query-parser");
      mongoParser = mongoQueryParser.default;
    } catch {
      void 0;
    }
  }
  return mongoParser;
};

// 检测是否为 MongoDB use 语句
function isMongoUseStatement(text: string): boolean {
  const trimmed = text.trim();
  // MongoDB use 语句格式：use database_name
  // 数据库名可以包含字母、数字、下划线、连字符等
  const usePattern = /^use\s+[a-zA-Z0-9_-]+(\s*;?\s*)$/i;
  return usePattern.test(trimmed);
}

// 校验 MongoDB use 语句
function validateMongoUseStatement(text: string): {
  valid: boolean;
  error?: string;
} {
  const trimmed = text.trim();

  if (!trimmed) {
    return { valid: false, error: "use 语句不能为空" };
  }

  // 检查格式：use database_name
  const usePattern = /^use\s+([a-zA-Z0-9_-]+)(\s*;?\s*)$/i;
  const match = trimmed.match(usePattern);

  if (!match) {
    return { valid: false, error: "use 语句格式错误，应为：use database_name" };
  }

  const dbName = match[1];
  if (!dbName) {
    return { valid: false, error: "数据库名称不能为空" };
  }

  // 数据库名不能以数字开头
  if (/^\d/.test(dbName)) {
    return { valid: false, error: "数据库名称不能以数字开头" };
  }

  return { valid: true };
}

// 检测查询类型：SQL 或 MongoDB
function detectQueryType(text: string): "sql" | "mongodb" {
  const trimmed = text.trim();

  // 优先判断是否可能为 MongoDB 查询（MongoDB shell 命令格式）
  const isMongo =
    trimmed.startsWith("db.") ||
    trimmed.includes(".find(") ||
    trimmed.includes(".aggregate(") ||
    trimmed.includes(".insert(") ||
    trimmed.includes(".update(") ||
    trimmed.includes(".delete(") ||
    trimmed.includes(".remove(") ||
    trimmed.startsWith("use ");

  if (isMongo) {
    return "mongodb";
  }

  // 默认尝试 SQL
  return "sql";
}

// SQL 和 MongoDB 语法检查器（自动识别）
export function sqlLinter(translate: boolean = false) {
  return (view: EditorView) => {
    const diagnostics: Diagnostic[] = [];
    const text = view.state.doc.toString();

    if (!text.trim()) {
      return diagnostics;
    }

    // 按行分割文本
    const lines = text.split("\n");
    let currentOffset = 0;
    const nonUseLines: Array<{ line: string; start: number; end: number }> = [];

    // 第一遍遍历：单独判断 use 行，收集非 use 行
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineStart = currentOffset;
      const lineEnd = currentOffset + line.length;
      const trimmedLine = line.trim();

      // 跳过空行
      if (!trimmedLine) {
        currentOffset = lineEnd + 1; // +1 是换行符
        continue;
      }

      // 单独判断 use 行
      if (isMongoUseStatement(trimmedLine)) {
        const validation = validateMongoUseStatement(trimmedLine);
        if (!validation.valid) {
          diagnostics.push({
            from: lineStart,
            to: lineEnd,
            severity: "error",
            message: translate
              ? translateError(validation.error || "use 语句格式错误")
              : validation.error || "use 语句格式错误",
          });
        }
      } else {
        // 收集非 use 行
        nonUseLines.push({
          line: line,
          start: lineStart,
          end: lineEnd,
        });
      }

      currentOffset = lineEnd + 1; // +1 是换行符
    }

    // 第二遍：统一判断所有非 use 行
    if (nonUseLines.length > 0) {
      // 合并所有非 use 行
      const nonUseText = nonUseLines?.map((item) => item.line).join("\n");
      const nonUseStart = nonUseLines[0].start;
      const nonUseEnd = nonUseLines[nonUseLines.length - 1].end;

      // 判断查询类型
      const queryType = detectQueryType(nonUseText);

      if (queryType === "mongodb") {
        // MongoDB 语句使用 mongoParser 校验
        if (mongoParser) {
          try {
            mongoParser(nonUseText);
          } catch (e: unknown) {
            const errorMessage = (e as Error).message;
            diagnostics.push({
              from: nonUseStart,
              to: nonUseEnd,
              severity: "error",
              message: translate ? translateError(errorMessage) : errorMessage,
            });
          }
        } else {
          // 如果解析器还未加载，尝试加载
          loadMongoParser().then((parser) => {
            if (parser) {
              try {
                parser(nonUseText);
              } catch {
                void 0;
              }
            }
          });
        }
      } else {
        // SQL 语句使用 SQL 解析器
        if (sqlParser) {
          try {
            sqlParser.astify(nonUseText);
          } catch (e: unknown) {
            const errorMessage = (e as Error).message;
            diagnostics.push({
              from: nonUseStart,
              to: nonUseEnd,
              severity: "error",
              message: translate ? translateError(errorMessage) : errorMessage,
            });
          }
        } else {
          // 如果解析器还未加载，尝试加载
          loadSqlParser().then((parser) => {
            if (parser) {
              try {
                parser.astify(nonUseText);
              } catch {
                void 0;
              }
            }
          });
        }
      }
    }

    return diagnostics;
  };
}

// 导出预加载函数，供外部使用
export { loadSqlParser, loadMongoParser };
