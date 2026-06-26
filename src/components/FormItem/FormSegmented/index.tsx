import { SegmentedProps as AntdSegmentedProps, Segmented } from "antd";
import ItemContainer, { ItemContainerProps } from "../ItemContainer";
import styles from "./index.module.less";

import React from "react";

export interface FormSegmentedProps extends ItemContainerProps {
  componentProps?: AntdSegmentedProps;
}

const FormSegmented: React.FC<FormSegmentedProps> = (props) => {
  const {
    componentProps = {
      options: [],
    },
    disabled,
    className: itemClassName,
    ...formItemProps
  } = props;
  const { className, ...segmentedConfig } = componentProps;

  return (
    <ItemContainer {...formItemProps} className={`${itemClassName ?? ""}`}>
      <Segmented
        {...segmentedConfig}
        className={`${styles.FormSegmented} ${className ?? ""}`}
        disabled={segmentedConfig.disabled ?? disabled}
      />
    </ItemContainer>
  );
};

export default FormSegmented;
