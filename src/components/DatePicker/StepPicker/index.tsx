import React, { useState } from "react";
import styles from "./index.module.less";
import dayjs from "dayjs";
import Button from "@/components/Button";
import classNames from "classnames";
import Icon from "@/components/Icon";

const formatMap = {
  day: "DD日",
  month: "MM月",
  year: "YYYY年",
};

const returnFormat = {
  day: "YYYY-MM-DD",
  month: "YYYY-MM",
  year: "YYYY",
};

interface ItemProps {
  className?: string;
}

export interface StepPickerProps {
  step?: number;
  picker?: "day" | "month" | "year";
  onChange?: (date: string) => void;
  value?: string;
  className?: string;
  disabled?: boolean;
  prevItemProps?: ItemProps;
  nextItemProps?: ItemProps;
  timeItemProps?: ItemProps;
  minDate?: string;
  maxDate?: string;
}

const StepPicker: React.FC<StepPickerProps> = (props) => {
  const {
    step = 1,
    picker = "day",
    onChange,
    value,
    className,
    disabled,
    prevItemProps,
    nextItemProps,
    timeItemProps,
    minDate,
    maxDate,
  } = props;
  const [date, setDate] = useState<dayjs.Dayjs>(value ? dayjs(value) : dayjs());

  return (
    <div className={classNames(styles.StepPicker, className)}>
      <Button
        {...prevItemProps}
        className={classNames(styles.icon, prevItemProps?.className)}
        onClick={() => {
          if (
            !!minDate &&
            date.subtract(step, picker).isBefore(dayjs(minDate))
          ) {
            return;
          }

          setDate(date.subtract(step, picker));
          onChange?.(date.subtract(step, picker).format(returnFormat[picker]));
        }}
        icon={<Icon icon="ant-design:left-outlined" />}
        disabled={
          disabled ||
          (!!minDate && date.subtract(step, picker).isBefore(dayjs(minDate)))
        }
      />
      <Button
        type="primary"
        disabled={disabled}
        className={styles.time}
        {...timeItemProps}
      >
        {date.format(formatMap[picker])}
      </Button>
      <Button
        {...nextItemProps}
        className={classNames(styles.icon, nextItemProps?.className)}
        onClick={() => {
          if (!!maxDate && date.isAfter(dayjs(maxDate))) {
            return;
          }
          setDate(date.add(step, picker));
          onChange?.(date.add(step, picker).format(returnFormat[picker]));
        }}
        icon={<Icon icon="ant-design:right-outlined" />}
        disabled={disabled || (!!maxDate && date.isAfter(dayjs(maxDate)))}
      />
    </div>
  );
};

export default StepPicker;
