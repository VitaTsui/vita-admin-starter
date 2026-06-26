import React, { useEffect, useState } from "react";
import styles from "./index.module.less";
import Input, { InputProps } from "../";
import { InputNumberProps } from "../Number";
import { Equal } from "hsu-utils";
import classNames from "classnames";
import { CloseCircleFilled } from "@ant-design/icons";

type Value = [string | undefined, string | undefined];

type InputPropsType = Omit<
  InputProps,
  "ref" | "suffix" | "prefix" | "allowClear" | "placeholder"
>;

interface IProps {
  type: "INPUT";
  beforeInput?: InputPropsType;
  afterInput?: InputPropsType;
}

type InputNumberPropsType = Omit<
  InputNumberProps,
  "ref" | "suffix" | "prefix" | "allowClear" | "placeholder"
>;

interface NProps {
  type: "NUMBER";
  beforeInput?: InputNumberPropsType;
  afterInput?: InputNumberPropsType;
}

type RangeInputType = "INPUT" | "NUMBER";

interface RProps {
  type: RangeInputType;
  value?: Value;
  defaultValue?: Value;
  onChange?: (value?: Value) => void;
  allowClear?: boolean;
  suffix?: React.ReactNode;
  prefix?: React.ReactNode;
  placeholder?: [string, string];
  disabled?: boolean;
}

export type RangeInputProps = RProps & (IProps | NProps);

const RangeInput: React.FC<RangeInputProps> = (props) => {
  const {
    type = "NUMBER",
    beforeInput,
    afterInput,
    value,
    defaultValue,
    onChange,
    allowClear,
    suffix,
    prefix,
    placeholder = ["请输入", "请输入"],
    disabled,
  } = props;

  // 初始化时优先使用 value，其次使用 defaultValue
  const initialValue = value !== undefined ? value : defaultValue;

  const [_value, setValue] = useState<Value | undefined>(initialValue);
  const [lastValue, setLastValue] = useState<Value | undefined>(initialValue);
  const [focus, setFocus] = useState<boolean>(false);
  const prevValueRef = React.useRef<Value | undefined>(undefined);

  useEffect(() => {
    // 只在外部 value prop 真正变化时才更新内部状态
    if (!Equal.ObjEqual(prevValueRef.current, value)) {
      prevValueRef.current = value;

      if (value !== undefined) {
        setValue(value);
        setLastValue(value);
      } else {
        // 只在初始化或外部主动设置为 undefined 时清空
        setValue(undefined);
        setLastValue(undefined);
      }
    }
  }, [value]);

  const onChangeValue = (value: Value) => {
    setValue(value);

    if (!value.includes(undefined) && !Equal.ObjEqual(value, lastValue)) {
      setLastValue(value);
      onChange?.(value);
    } else {
      setLastValue(undefined);
      onChange?.(undefined);
    }
  };

  const contennt = () => {
    switch (type) {
      case "INPUT":
        return (
          <div
            className={classNames(styles.RangeInput, {
              [styles.focused]: focus,
            })}
            tabIndex={1}
          >
            <Input
              {...{
                ...(beforeInput as InputProps),
                className: classNames(
                  beforeInput?.className,
                  styles.beforeInput
                ),
                value: _value?.[0],
                onChange: (v) => onChangeValue([v || undefined, _value?.[1]]),
                onFocus: () => setFocus(true),
                onBlur: () => setFocus(false),
                allowClear: false,
                suffix: undefined,
                prefix: undefined,
                placeholder: placeholder?.[0],
                disabled,
              }}
            />
            <span>-</span>
            <Input
              {...{
                ...(afterInput as InputProps),
                className: classNames(afterInput?.className, styles.afterInput),
                value: _value?.[1],
                onChange: (v) => onChangeValue([_value?.[0], v || undefined]),
                onFocus: () => setFocus(true),
                onBlur: () => setFocus(false),
                allowClear: false,
                suffix: undefined,
                prefix: undefined,
                placeholder: placeholder?.[1],
                disabled,
              }}
            />
          </div>
        );
      case "NUMBER":
        return (
          <div
            className={classNames(styles.RangeInput, {
              [styles.focused]: focus,
            })}
            tabIndex={1}
          >
            <Input.Number
              {...{
                ...(beforeInput as InputNumberProps),
                className: classNames(
                  beforeInput?.className,
                  styles.beforeInput
                ),
                value: _value?.[0],
                onChange: (v) => onChangeValue([v || undefined, _value?.[1]]),
                onFocus: () => setFocus(true),
                onBlur: () => setFocus(false),
                max: _value?.[1],
                allowClear: false,
                suffix: undefined,
                prefix: undefined,
                placeholder: placeholder?.[0],
                disabled,
              }}
            />
            <span>-</span>
            <Input.Number
              {...{
                ...(afterInput as InputNumberProps),
                className: classNames(afterInput?.className, styles.afterInput),
                value: _value?.[1],
                onChange: (v) => onChangeValue([_value?.[0], v || undefined]),
                onFocus: () => setFocus(true),
                onBlur: () => setFocus(false),
                min: _value?.[0],
                allowClear: false,
                suffix: undefined,
                prefix: undefined,
                placeholder: placeholder?.[1],
                disabled,
              }}
            />
          </div>
        );
    }
  };

  return (
    <div className={styles.RangeContainer}>
      {prefix && <div className={styles.RangePrefix}>{prefix}</div>}
      <div
        className={classNames(styles.RangeContent, {
          [styles.RangeClear]: allowClear,
        })}
        onMouseEnter={() => setFocus(true)}
        onMouseLeave={() => setFocus(false)}
      >
        {contennt()}
        {allowClear && (
          <CloseCircleFilled
            className={styles.RangeClear}
            onClick={() => {
              onChangeValue([undefined, undefined]);
            }}
            onMouseEnter={() => setFocus(true)}
            onMouseLeave={() => setFocus(false)}
            style={{
              display: _value !== undefined ? "block" : "none",
            }}
          />
        )}
      </div>
      {suffix && <div className={styles.RangeSuffix}>{suffix}</div>}
    </div>
  );
};

export default RangeInput;
