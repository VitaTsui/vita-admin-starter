import ItemContainer, { ItemContainerProps } from "../../ItemContainer";

import React from "react";
import classNames from "classnames";
import styles from "../index.module.less";
import DatePicker from "@/components/DatePicker";
import { RangePickerProps } from "@/components/DatePicker/RangePicker";

export interface FormRangePickerProps extends ItemContainerProps {
  componentProps?: RangePickerProps;
}

const FormRangePicker: React.FC<FormRangePickerProps> = (props) => {
  const {
    componentProps = {},
    className: itemClassName,
    disabled,
    ...formItemProps
  } = props;
  const { className, ...datePickerConfig } = componentProps;

  return (
    <ItemContainer {...formItemProps} className={`${itemClassName ?? ""}`}>
      <DatePicker.RangePicker
        {...datePickerConfig}
        disabled={datePickerConfig.disabled ?? disabled}
        className={classNames(styles.DatePicker, className)}
      />
    </ItemContainer>
  );
};

export default FormRangePicker;
