import DatePicker, { DatePickerProps } from "@/components/DatePicker";
import FormRangePicker, { FormRangePickerProps } from "./FormRangePicker";
import ItemContainer, { ItemContainerProps } from "../ItemContainer";
import FormStepPicker, { FormStepPickerProps } from "./FormStepPicker";

import React from "react";
import classNames from "classnames";
import styles from "./index.module.less";

export type { FormRangePickerProps, FormStepPickerProps };

export interface FormDatePickerProps extends ItemContainerProps {
  componentProps?: DatePickerProps;
}

interface FormDatePickerFC extends React.FC<FormDatePickerProps> {
  RangePicker: React.FC<FormRangePickerProps>;
  StepPicker: React.FC<FormStepPickerProps>;
}

const FormDatePicker: FormDatePickerFC = (props) => {
  const {
    componentProps = {},
    className: itemClassName,
    disabled,
    ...formItemProps
  } = props;
  const { className, ...datePickerConfig } = componentProps;

  return (
    <ItemContainer {...formItemProps} className={`${itemClassName ?? ""}`}>
      <DatePicker
        {...datePickerConfig}
        disabled={datePickerConfig.disabled ?? disabled}
        className={classNames(styles.DatePicker, className)}
      />
    </ItemContainer>
  );
};

FormDatePicker.RangePicker = FormRangePicker;
FormDatePicker.StepPicker = FormStepPicker;

export default FormDatePicker;
