import React from "react";
import classNames from "classnames";
import Icon from "@/components/Icon";
import styles from "./index.module.less";

export interface AgentToggleConfig {
  key: string;
  icon: string;
  label: string;
  className?: string;
}

interface AgentToggleButtonProps {
  config: AgentToggleConfig;
  active: boolean;
  onClick: () => void;
}

const AgentToggleButton: React.FC<AgentToggleButtonProps> = ({
  config,
  active,
  onClick,
}) => {
  return (
    <li>
      <div
        className={classNames(styles.featureToggle, config.className, {
          [styles.active]: active,
        })}
        onClick={onClick}
      >
        <Icon icon={config.icon} className={styles.icon} />
        <span>{config.label}</span>
      </div>
    </li>
  );
};

export default AgentToggleButton;
