import React from "react";

import Icon from "@/components/Icon";
import classNames from "classnames";
import { message } from "antd";
import styles from "./index.module.less";
import clipboard from "copy-to-clipboard";
import MarkdownIt from "markdown-it";
import markdownLink from "markdown-it-link-attributes";

interface CopyProps {
  content: string;
}

const md = MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

md.use(markdownLink, {
  attrs: {
    target: "_blank",
    rel: "noopener",
  },
});

const Copy: React.FC<CopyProps> = (props) => {
  const { content } = props;

  function copyMdText(text: string) {
    if (!text) return;
    const html = md.render(text);
    const parser = new DOMParser();
    const textContent = parser.parseFromString(html, "text/html")?.body
      ?.textContent;
    if (textContent) {
      // const mdText = textContent ? textContent.replace(/\n{2,}/g, '\n') : '';
      const result = clipboard(textContent);
      if (result) {
        message.success("复制成功");
      }
    }
  }

  const onCopy = () => {
    if (content) {
      copyMdText(content);
    }
  };

  return (
    <>
      <div className={classNames(styles.Copy)} onClick={onCopy}>
        <Icon icon="ci:copy" className={classNames(styles.icon)} />
        {/* <span>{text ?? "复制"}</span> */}
      </div>
    </>
  );
};

export default Copy;

