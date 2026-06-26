import { RadioGroupProps as AntdRadioGroupProps, Radio } from "antd";
import ItemContainer, { ItemContainerProps } from "../ItemContainer";

import React from "react";
import classNames from "classnames";
import styles from "./index.module.less";

interface RadioGroupProps extends AntdRadioGroupProps {
  radioStyle?: "rect" | "circle";
}

export interface FormRadioProps extends ItemContainerProps {
  componentProps?: RadioGroupProps;
}

const FormRadio: React.FC<FormRadioProps> = (props) => {
  const {
    componentProps = {},
    className: itemClassName,
    disabled,
    ...formItemProps
  } = props;
  const { className, radioStyle = "circle", ...radioConfig } = componentProps;

  return (
    <ItemContainer {...formItemProps} className={`${itemClassName ?? ""}`}>
      <Radio.Group
        {...radioConfig}
        disabled={radioConfig.disabled ?? disabled}
        className={classNames({
          [styles.radioGroup]: true,
          [className ?? ""]: true,
          [styles[radioStyle]]: radioStyle,
        })}
      />
    </ItemContainer>
  );
};

export default FormRadio;
