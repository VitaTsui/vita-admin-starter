import React from "react";
import Button from "../../../Button";
import classNames from "classnames";
import styles from "./index.module.less";

interface ExpandButtonsProps {
  onExpand: () => void;
  onCollapse: () => void;
  expandClassName?: string;
}

export const ExpandButtons: React.FC<ExpandButtonsProps> = ({
  onExpand,
  onCollapse,
  expandClassName,
}) => {
  return (
    <div className={classNames(styles.expandBtn, expandClassName)}>
      <Button onClick={onExpand} className={styles.expandBtnItem}>
        一键展开
      </Button>
      <Button onClick={onCollapse} className={styles.expandBtnItem}>
        一键收起
      </Button>
    </div>
  );
};

