import React from "react";
import Icon from "@/components/Icon";
import Markdown from "@/components/Markdown";
import classNames from "classnames";
import styles from "../BasePreview/index.module.less";

interface MarkdownPreviewProps {
  text?: string;
  onClose?: () => void;
  className?: string;
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({
  text,
  onClose,
  className,
}) => {
  return (
    <div className={classNames(styles.BasePreview, className)}>
      <div className={styles.close} onClick={() => onClose?.()}>
        <Icon icon="ant-design:close-outlined" />
      </div>
      <div className={styles.text}>
        <Markdown.Views>{text}</Markdown.Views>
      </div>
    </div>
  );
};

export default MarkdownPreview;

