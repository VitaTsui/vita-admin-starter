import React, { useState } from "react";
import classNames from "classnames";

import styles from "./blocks.module.less";

export interface ArtifactBlockProps {
  /** 原始代码（html/svg） */
  code: string;
  /** 语言标记（html / svg） */
  lang: string;
  /** 代码视图（沿用外层的高亮代码块渲染） */
  codeView: React.ReactNode;
}

/**
 * HTML/SVG Artifacts 预览块（对标 Claude Artifacts）：代码 / 预览两个页签，
 * 预览在 sandbox iframe（仅 allow-scripts，无同源权限）里渲染模型产出的页面。
 */
const ArtifactBlock: React.FC<ArtifactBlockProps> = ({ code, lang, codeView }) => {
  const [tab, setTab] = useState<"preview" | "code">("preview");

  return (
    <div className={styles.artifact}>
      <div className={styles.artifactBar}>
        <span className={styles.artifactLang}>{lang.toUpperCase()} · Artifact</span>
        <div className={styles.artifactTabs}>
          <button
            type="button"
            className={classNames(styles.artifactTab, {
              [styles.artifactTabActive]: tab === "preview",
            })}
            onClick={() => setTab("preview")}
          >
            预览
          </button>
          <button
            type="button"
            className={classNames(styles.artifactTab, {
              [styles.artifactTabActive]: tab === "code",
            })}
            onClick={() => setTab("code")}
          >
            代码
          </button>
        </div>
      </div>
      {tab === "preview" ? (
        <iframe
          className={styles.artifactFrame}
          title="artifact-preview"
          sandbox="allow-scripts"
          srcDoc={code}
        />
      ) : (
        codeView
      )}
    </div>
  );
};

export default ArtifactBlock;
