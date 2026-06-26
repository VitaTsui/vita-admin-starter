import React, { useEffect, useRef } from "react";
import ReactCodeMirror, {
  EditorView,
  ReactCodeMirrorProps,
} from "@uiw/react-codemirror";
import { Extension } from "@codemirror/state";
import classNames from "classnames";
import styles from "./index.module.less";
import { vscodeLight } from "@uiw/codemirror-theme-vscode";
import { linter, LintSource, Diagnostic } from "@codemirror/lint";
import { sqlLinter, loadSqlParser } from "./linters/sqlLinter";
import { jsonLinter, loadJsonParser } from "./linters/jsonLinter";

// 支持的语言类型
export type CodeMirrorLanguageType = "sql" | "json" | "plain";

export interface CodeMirrorProps extends Omit<
  ReactCodeMirrorProps,
  "extensions" | "onError"
> {
  /** 语言类型，支持按需引入 */
  language?: CodeMirrorLanguageType;
  /** 是否启用语法检查 */
  enableLint?: boolean;
  /** 错误信息回调 */
  onLintError?: (error: string | null) => void;
  /** 是否有错误，用于显示错误边框 */
  hasError?: boolean;
  /** 是否翻译错误信息为中文，默认 false */
  translateError?: boolean;
  /**
   * JSON 校验是否允许根节点为数组 `[...]`，默认 false（仅允许对象 `{...}`）
   */
  allowJsonArrayRoot?: boolean;
}

// 按需引入语言支持
const getLanguageExtension = async (language: CodeMirrorLanguageType) => {
  switch (language) {
    case "sql": {
      const { sql } = await import("@codemirror/lang-sql");
      return sql();
    }
    case "json": {
      const { json } = await import("@codemirror/lang-json");
      return json();
    }
    case "plain":
    default:
      return null;
  }
};

const CodeMirror: React.FC<CodeMirrorProps> = (props) => {
  const {
    className,
    language = "sql",
    enableLint = true,
    basicSetup,
    onLintError,
    hasError = false,
    translateError = false,
    allowJsonArrayRoot = false,
    ...restProps
  } = props;
  const [extensions, setExtensions] = React.useState<Extension[]>([]);
  const onLintErrorRef = useRef(onLintError);
  onLintErrorRef.current = onLintError;

  useEffect(() => {
    const loadExtensions = async () => {
      const languageExt = await getLanguageExtension(language);
      const newExtensions: Extension[] = [EditorView.lineWrapping];

      if (languageExt) {
        newExtensions.push(languageExt);
      }

      if (enableLint) {
        let lintSource: LintSource | null = null;

        if (language === "sql") {
          // 预加载 SQL 解析器
          await loadSqlParser();
          lintSource = sqlLinter(translateError);
          newExtensions.push(linter(lintSource));
        } else if (language === "json") {
          // 预加载 JSON 解析器
          await loadJsonParser();
          lintSource = jsonLinter({
            translate: translateError,
            allowArrayRoot: allowJsonArrayRoot,
          });
          newExtensions.push(linter(lintSource));
        }

        // 添加错误监听扩展
        if (lintSource) {
          newExtensions.push(
            EditorView.updateListener.of((update) => {
              if (update.docChanged || update.viewportChanged) {
                // 延迟执行以等待 linter 完成
                setTimeout(async () => {
                  try {
                    const diagnosticsResult = lintSource?.(update.view);
                    // 处理可能是 Promise 的情况
                    const diagnostics: readonly Diagnostic[] =
                      diagnosticsResult instanceof Promise
                        ? await diagnosticsResult
                        : diagnosticsResult || [];

                    const errors = diagnostics.filter(
                      (d: Diagnostic) => d.severity === "error",
                    );
                    if (errors && errors.length > 0) {
                      onLintErrorRef.current?.(errors[0].message);
                    } else {
                      onLintErrorRef.current?.(null);
                    }
                  } catch (e) {
                    // 忽略错误
                    onLintErrorRef.current?.(null);
                  }
                }, 150);
              }
            }),
          );
        }
      } else {
        // 如果禁用了 lint，清除错误
        onLintErrorRef.current?.(null);
      }

      setExtensions(newExtensions);
    };

    loadExtensions();
  }, [language, enableLint, translateError, allowJsonArrayRoot]);

  return (
    <ReactCodeMirror
      minHeight="100px"
      theme={vscodeLight}
      {...restProps}
      basicSetup={
        typeof basicSetup === "boolean"
          ? basicSetup
          : {
              lineNumbers: true,
              highlightActiveLineGutter: true,
              foldGutter: true,
              dropCursor: true,
              allowMultipleSelections: true,
              indentOnInput: true,
              bracketMatching: true,
              closeBrackets: true,
              autocompletion: true,
              highlightActiveLine: true,
              highlightSelectionMatches: true,
              ...(basicSetup ?? {}),
            }
      }
      extensions={extensions}
      className={classNames(styles.CodeMirror, className, {
        [styles.hasError]: hasError,
      })}
    />
  );
};

export default CodeMirror;
