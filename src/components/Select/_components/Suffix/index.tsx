import React, { ReactNode } from "react";
import styles from "../../index.module.less";

interface SuffixProps {
  suffix: ReactNode;
}

export const Suffix: React.FC<SuffixProps> = ({ suffix }) => {
  return (
    <span className={styles.suffix}>
      <span className="ant-input-suffix">{suffix}</span>
    </span>
  );
};

