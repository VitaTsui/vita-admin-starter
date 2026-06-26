import React from "react";
import {
  Checkbox as AntdCheckbox,
  CheckboxProps as AntdCheckboxProps,
} from "antd";
import styles from "./index.module.less";
import classNames from "classnames";
import CheckboxGroup, { CheckboxGroupProps } from "./CheckboxGroup";

export type { CheckboxGroupProps };

export interface CheckboxProps extends AntdCheckboxProps {
  outline?: boolean;
}

interface CheckboxFC extends React.FC<CheckboxProps> {
  Group: React.FC<CheckboxGroupProps>;
}

const Checkbox: CheckboxFC = (props) => {
  const { className, outline, ...rest } = props;

  return (
    <AntdCheckbox
      className={classNames(styles.checkbox, className, {
        [styles.outline]: outline,
      })}
      {...rest}
    />
  );
};

Checkbox.Group = CheckboxGroup;

export default Checkbox;
