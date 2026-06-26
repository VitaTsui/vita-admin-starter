import ItemContainer, { ItemContainerProps } from "../../ItemContainer";

import React from "react";
import classNames from "classnames";
import styles from "../index.module.less";
import DatePicker from "@/components/DatePicker";
import { StepPickerProps } from "@/components/DatePicker/StepPicker";

export interface FormStepPickerProps extends ItemContainerProps {
  componentProps?: StepPickerProps;
}

const FormStepPicker: React.FC<FormStepPickerProps> = (props) => {
  const {
    componentProps = {},
    className: itemClassName,
    disabled,
    ...formItemProps
  } = props;
  const { className, ...stepPickerConfig } = componentProps;

  return (
    <ItemContainer {...formItemProps} className={`${itemClassName ?? ""}`}>
      <DatePicker.StepPicker
        {...stepPickerConfig}
        disabled={stepPickerConfig.disabled ?? disabled}
        className={classNames(styles.DatePicker, className)}
      />
    </ItemContainer>
  );
};

export default FormStepPicker;
