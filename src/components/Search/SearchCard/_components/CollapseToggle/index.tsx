import React from "react";
import Icon from "@/components/Icon";
import classNames from "classnames";
import styles from "../../index.module.less";

interface CollapseToggleProps {
  collapse: boolean;
  onToggle: () => void;
}

export const CollapseToggle: React.FC<CollapseToggleProps> = ({
  collapse,
  onToggle,
}) => {
  return (
    <div className={styles.collapseExpand}>
      <span onClick={onToggle}>
        <Icon
          icon="mingcute:up-line"
          className={classNames(styles.collapseExpandIcon, {
            [styles.collapsed]: collapse,
          })}
          style={collapse ? { transform: "rotate(180deg)" } : undefined}
        />
      </span>
    </div>
  );
};
