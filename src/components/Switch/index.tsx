import { SwitchProps as AntSwitchProps, Switch as AntSwitch } from "antd";
import React from "react";
import { SelectOption } from "../Select";

export interface SwitchProps extends AntSwitchProps {
  options?: SelectOption[];
  trueValue?: number | string;
  falseValue?: number | string;
}

const Switch: React.FC<SwitchProps> = (props) => {
  const {
    options,
    trueValue,
    falseValue,
    checkedChildren,
    unCheckedChildren,
    ...rest
  } = props;

  return (
    <AntSwitch
      {...rest}
      checkedChildren={
        checkedChildren ||
        options?.find((item) => item.value === trueValue)?.label
      }
      unCheckedChildren={
        unCheckedChildren ||
        options?.find((item) => item.value === falseValue)?.label
      }
    />
  );
};

export default Switch;
