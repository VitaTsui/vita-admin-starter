import React from "react";
import ReactMarkdown, { Options as ReactMarkdownProps } from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import classNames from "classnames";
import styles from "./index.module.less";
import "highlight.js/styles/atom-one-dark.min.css";
import "katex/dist/katex.min.css";
import { generateRandomStr } from "hsu-utils";
import Copy, { CopyProps } from "@/components/Copy";
import MermaidBlock from "./MermaidBlock";
import ArtifactBlock from "./ArtifactBlock";

/** 支持 Artifacts 预览的代码块语言（对标 Claude Artifacts） */
const ARTIFACT_LANGS = new Set(["html", "svg"]);

/**
 * 从代码块 children 还原纯文本源码：rehype-highlight 会把代码切成嵌套的
 * <span> 高亮元素，直接 join 会得到 [object Object]，需递归抽取文本。
 */
const extractText = (node: React.ReactNode): string => {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (React.isValidElement(node)) {
    return extractText((node.props as { children?: React.ReactNode }).children);
  }
  return "";
};

export interface MarkdownViewsProps extends ReactMarkdownProps {
  copyProps?: Omit<CopyProps, "id">;
}

const MarkdownViews: React.FC<MarkdownViewsProps> = (props) => {
  const { className, copyProps, components: extraComponents } = props;

  return (
    <ReactMarkdown
      {...props}
      rehypePlugins={[rehypeHighlight, rehypeKatex]}
      remarkPlugins={[remarkGfm, remarkMath]}
      className={classNames(styles.MarkdownViews, className, "markdown-body")}
      components={{
        code: ({ className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || "");
          if (match?.length) {
            const lang = match[1].toLowerCase();
            const codeText = extractText(children);

            // Mermaid 图：直接渲染为 SVG（流式不完整时回退代码展示）
            if (lang === "mermaid") {
              return <MermaidBlock code={codeText} />;
            }

            const id = generateRandomStr(10);
            const codeView = (
              <div className={classNames(styles.code)}>
                <div className={classNames(styles.nav)}>
                  <Copy id={id} md={false} {...copyProps} />
                </div>
                <div className={classNames(styles.content)}>
                  <code
                    id={id}
                    {...props}
                    className={classNames(styles.code_content, className)}
                  >
                    {children}
                  </code>
                </div>
              </div>
            );

            // HTML/SVG：Artifacts 预览（sandbox iframe）+ 代码两个页签
            if (ARTIFACT_LANGS.has(lang)) {
              return (
                <ArtifactBlock code={codeText} lang={lang} codeView={codeView} />
              );
            }
            return codeView;
          }
          return <code {...props}>{children}</code>;
        },
        td: ({ children, ...props }) => {
          return (
            <td {...props}>
              {Array.isArray(children)
                ? children?.map((item) => {
                    if (item === "<br>") {
                      return <br />;
                    }

                    return item;
                  })
                : children}
            </td>
          );
        },
        ...(extraComponents || {}),
      }}
    />
  );
};

export default MarkdownViews;
