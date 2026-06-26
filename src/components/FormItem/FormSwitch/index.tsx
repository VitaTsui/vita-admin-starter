import { SwitchProps as AntdSwitchProps, Switch } from "antd";
import ItemContainer, { ItemContainerProps } from "../ItemContainer";

import React from "react";
import classNames from "classnames";
import styles from "./index.module.less";

export interface FormSwitchProps extends ItemContainerProps {
  componentProps?: AntdSwitchProps;
}

const FormSwitch: React.FC<FormSwitchProps> = (props) => {
  const {
    componentProps = {},
    className: itemClassName,
    disabled,
    ...formItemProps
  } = props;
  const { className, ...switchConfig } = componentProps;

  return (
    <ItemContainer {...formItemProps} className={`${itemClassName ?? ""}`}>
      <Switch
        {...switchConfig}
        disabled={switchConfig.disabled ?? disabled}
        className={classNames(className, styles.switch)}
      />
    </ItemContainer>
  );
};

export default FormSwitch;
