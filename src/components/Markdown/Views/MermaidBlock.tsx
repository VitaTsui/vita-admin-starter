import React, { useEffect, useMemo, useState } from "react";

import { generateRandomStr } from "hsu-utils";
import styles from "./blocks.module.less";

// mermaid 体积大，懒加载并全局只初始化一次
let mermaidPromise: Promise<typeof import("mermaid")["default"]> | null = null;
const loadMermaid = () => {
  if (!mermaidPromise) {
    mermaidPromise = import("mermaid").then((m) => {
      m.default.initialize({
        startOnLoad: false,
        securityLevel: "loose",
        theme: "neutral",
      });
      return m.default;
    });
  }
  return mermaidPromise;
};

export interface MermaidBlockProps {
  code: string;
}

/**
 * Mermaid 图渲染块（对标 Claude/Kimi 等的流程图渲染）：
 * 渲染成功显示 SVG；语法不完整（如流式生成中）静默回退为代码展示。
 */
const MermaidBlock: React.FC<MermaidBlockProps> = ({ code }) => {
  const [svg, setSvg] = useState<string | null>(null);
  const id = useMemo(() => `mmd-${generateRandomStr(8)}`, []);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      loadMermaid()
        .then((mermaid) => mermaid.render(id, code))
        .then(({ svg: rendered }) => {
          if (!cancelled) setSvg(rendered);
        })
        .catch(() => {
          // 流式生成中代码不完整属正常态，回退为代码展示
          if (!cancelled) setSvg(null);
          // mermaid.render 失败会在 DOM 残留错误占位节点，清理掉
          document.getElementById(`d${id}`)?.remove();
        });
    }, 300);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [code, id]);

  if (!svg) {
    return (
      <pre className={styles.mermaidFallback}>
        <code>{code}</code>
      </pre>
    );
  }
  return (
    <div
      className={styles.mermaid}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

export default MermaidBlock;
