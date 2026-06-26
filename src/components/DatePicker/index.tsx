import {
  DatePicker as AntdDatePicker,
  DatePickerProps as AntdDatePickerProps,
} from "antd";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Select, { SelectOption, SelectProps } from "../Select";
import { PickerRef } from "rc-picker";

import classNames from "classnames";
import styles from "./index.module.less";
import dayjs from "dayjs";
import RangePicker, { RangePickerProps } from "./RangePicker";
import StepPicker, { StepPickerProps } from "./StepPicker";
import { defaultModalPickerGetPopupContainer } from "./defaultModalPickerGetPopupContainer";

type Picker = "date" | "week" | "month" | "quarter" | "year" | "time";

const PickerOptions: SelectOption[] = [
  { label: "日期", value: "date" },
  { label: "周", value: "week" },
  { label: "月份", value: "month" },
  { label: "季度", value: "quarter" },
  { label: "年份", value: "year" },
];

export interface DatePickerProps extends Omit<
  AntdDatePickerProps,
  "picker" | "onChange"
> {
  picker?: Picker;
  showPicker?: boolean;
  pickerHide?: Array<Picker>;
  pickerSelectProps?: SelectProps;
  pickerOptions?: SelectOption[];
  dataPickerCls?: string;
  onChange?: (date?: string, picker?: Picker) => void;
}

interface DatePickerFC extends React.FC<DatePickerProps> {
  RangePicker: React.FC<RangePickerProps>;
  StepPicker: React.FC<StepPickerProps>;
}

const DatePicker: DatePickerFC = (props) => {
  const {
    showPicker = false,
    pickerHide = [],
    pickerSelectProps,
    disabled,
    pickerOptions,
    className,
    dataPickerCls,
    value,
    defaultValue,
    onChange,
    showTime,
    popupClassName,
    getPopupContainer,
    picker: pickerProps,
    ...datePickerProps
  } = props;
  const ref = useRef<PickerRef>(null);
  const [picker, setPicker] = useState<Picker>(pickerProps ?? "date");
  const prevPickerRef = useRef<Picker | undefined>(pickerProps);
  const isInitializedRef = useRef(false);
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);
  const defaultValueRef = useRef(defaultValue);
  const showTimeRef = useRef(showTime);

  // 保持 ref 最新
  useEffect(() => {
    onChangeRef.current = onChange;
    valueRef.current = value;
    defaultValueRef.current = defaultValue;
    showTimeRef.current = showTime;
  }, [onChange, value, defaultValue, showTime]);

  // 格式化日期值的辅助函数
  const formatDateByPicker = useCallback(
    (dateValue: dayjs.Dayjs, pickerType: Picker): string => {
      if (pickerType === "date") {
        if (showTimeRef.current) {
          return dateValue.format("YYYY-MM-DD HH:mm:ss");
        }
        return dateValue.format("YYYY-MM-DD");
      } else if (pickerType === "week") {
        return dateValue.format("YYYY-wo");
      } else if (pickerType === "month") {
        return dateValue.format("YYYY-MM");
      } else if (pickerType === "quarter") {
        return dateValue.format("YYYY-Q");
      } else if (pickerType === "year") {
        return dateValue.format("YYYY");
      } else if (pickerType === "time") {
        return dateValue.format("HH:mm:ss");
      }
      return "";
    },
    [],
  );

  // 处理 picker 变更时的 onChange
  const handlePickerChange = useCallback(
    (newPicker: Picker) => {
      // 当 picker 变更时，触发一次 onChange
      if (onChangeRef.current) {
        // 优先使用 value，如果没有则使用 defaultValue
        const currentValue = valueRef.current ?? defaultValueRef.current;
        if (currentValue) {
          // 如果有当前值或默认值，使用新的 picker 格式重新格式化
          const dateValue = dayjs(currentValue.toString());
          const formattedDate = formatDateByPicker(dateValue, newPicker);
          onChangeRef.current(formattedDate, newPicker);
        } else {
          // 如果既没有值也没有默认值，触发 onChange 传入空字符串
          onChangeRef.current("", newPicker);
        }
      }
    },
    [formatDateByPicker],
  );

  useEffect(() => {
    if (pickerProps !== undefined) {
      const prevPicker = prevPickerRef.current;

      // 标记为已初始化
      if (!isInitializedRef.current) {
        isInitializedRef.current = true;
      } else {
        // 当 picker 变更时，触发一次 onChange（排除初始化）
        if (prevPicker !== undefined && prevPicker !== pickerProps) {
          handlePickerChange(pickerProps);
        }
      }

      setPicker(pickerProps);
      prevPickerRef.current = pickerProps;
    }
  }, [handlePickerChange, pickerProps]);

  return (
    <div className={classNames(styles.DatePicker, className)}>
      {showPicker && picker !== "time" && (
        <Select
          {...pickerSelectProps}
          className={classNames(
            styles.pickerSelect,
            pickerSelectProps?.className,
          )}
          disabled={pickerSelectProps?.disabled ?? disabled}
          options={(pickerOptions ?? PickerOptions).filter(
            (item) => !pickerHide.includes(item.value as Picker),
          )}
          onChange={(v, o) => {
            pickerSelectProps?.onChange?.(v, o);
            const newPicker = v as Picker;
            handlePickerChange(newPicker);
            setPicker(newPicker);
            prevPickerRef.current = newPicker;
          }}
          value={picker}
          allowClear={false}
          showSearch={false}
        />
      )}
      <AntdDatePicker
        {...datePickerProps}
        ref={ref}
        popupClassName={classNames(styles.datePickerPopup, popupClassName)}
        getPopupContainer={getPopupContainer ?? defaultModalPickerGetPopupContainer}
        value={value ? dayjs(value.toString()) : undefined}
        defaultValue={defaultValue ? dayjs(defaultValue.toString()) : undefined}
        picker={picker}
        disabled={disabled}
        className={classNames(dataPickerCls, {
          [styles.antPicker]: !showPicker,
        })}
        style={{ flex: 1, width: 0 }}
        showTime={showTime}
        onChange={(v) => {
          let date = "";

          if (v) {
            if (picker === "date") {
              date = dayjs(v).format("YYYY-MM-DD");

              if (showTime) {
                date = dayjs(v).format("YYYY-MM-DD HH:mm:ss");
              }
            } else if (picker === "week") {
              date = dayjs(v).format("YYYY-wo");
            } else if (picker === "month") {
              date = dayjs(v).format("YYYY-MM");
            } else if (picker === "quarter") {
              date = dayjs(v).format("YYYY-Q");
            } else if (picker === "year") {
              date = dayjs(v).format("YYYY");
            } else if (picker === "time") {
              date = dayjs(v).format("HH:mm:ss");
            }
          }

          onChange?.(date, picker);
        }}
      />
    </div>
  );
};

DatePicker.RangePicker = RangePicker;
DatePicker.StepPicker = StepPicker;

export default DatePicker;
