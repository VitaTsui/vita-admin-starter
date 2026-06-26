import React from "react";
import Icon from "@/components/Icon";
import classNames from "classnames";
import styles from "../BasePreview/index.module.less";

interface TextPreviewProps {
  text?: string;
  onClose?: () => void;
  className?: string;
}

const TextPreview: React.FC<TextPreviewProps> = ({
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
        {text?.split("\n")?.map((p, idx) => {
          return <p key={idx}>{p}</p>;
        })}
      </div>
    </div>
  );
};

export default TextPreview;
