import ItemContainer, { ItemContainerProps } from "../ItemContainer";

import React from "react";
import classNames from "classnames";
import styles from "./index.module.less";
import Checkbox, { CheckboxProps } from "@/components/Checkbox";
import FormCheckboxGroup, { FormCheckboxGroupProps } from "./FormCheckboxGroup";

export type { FormCheckboxGroupProps };

export interface FormCheckboxProps extends ItemContainerProps {
  componentProps?: CheckboxProps;
}

interface FormCheckboxFC extends React.FC<FormCheckboxProps> {
  Group: React.FC<FormCheckboxGroupProps>;
}

const FormCheckbox: FormCheckboxFC = (props) => {
  const {
    componentProps = {},
    className: itemClassName,
    disabled,
    label,
    labelClassName,
    ...formItemProps
  } = props;
  const { className, ...checkboxConfig } = componentProps;

  return (
    <ItemContainer
      {...formItemProps}
      className={`${itemClassName ?? ""}`}
      valuePropName="checked"
    >
      <Checkbox
        {...checkboxConfig}
        disabled={checkboxConfig.disabled ?? disabled}
        className={classNames([styles.checkbox, className, labelClassName])}
        children={label}
      />
    </ItemContainer>
  );
};

FormCheckbox.Group = FormCheckboxGroup;

export default FormCheckbox;
