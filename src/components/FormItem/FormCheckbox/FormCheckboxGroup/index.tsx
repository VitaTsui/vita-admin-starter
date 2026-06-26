import ItemContainer, { ItemContainerProps } from "../../ItemContainer";

import React from "react";
import classNames from "classnames";
import styles from "./index.module.less";
import Checkbox, { CheckboxGroupProps } from "@/components/Checkbox";

export interface FormCheckboxGroupProps extends ItemContainerProps {
  componentProps?: CheckboxGroupProps;
}

const FormCheckboxGroup: React.FC<FormCheckboxGroupProps> = (props) => {
  const {
    componentProps = {},
    className: itemClassName,
    disabled,
    ...formItemProps
  } = props;
  const { className, ...checkboxConfig } = componentProps;

  return (
    <ItemContainer {...formItemProps} className={`${itemClassName ?? ""}`}>
      <Checkbox.Group
        {...checkboxConfig}
        disabled={checkboxConfig.disabled ?? disabled}
        className={classNames([styles.checkboxGroup, className])}
      />
    </ItemContainer>
  );
};

export default FormCheckboxGroup;
