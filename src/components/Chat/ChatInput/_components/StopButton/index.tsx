import React from "react";
import Icon from "@/components/Icon";
import styles from "./index.module.less";

interface StopButtonProps {
  onStop: () => void;
  stopIcon?: string;
}

const StopButton: React.FC<StopButtonProps> = (props) => {
  const { onStop, stopIcon = "eos-icons:loading" } = props;

  return (
    <li>
      <div className={styles.stop}>
        <Icon icon={stopIcon} fontSize={24} onClick={onStop} />
      </div>
    </li>
  );
};

export default StopButton;
