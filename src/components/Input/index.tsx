import {
  Input as AntdInput,
  InputProps as AntdInputProps,
  InputRef,
  Tooltip,
  TooltipProps,
} from "antd";
import InputNumber, { InputNumberProps } from "./Number";
import Password, { PasswordProps } from "./Password";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Search, { SearchProps } from "./Search";
import TextArea, { TextAreaProps } from "./TextArea";

import classNames from "classnames";
import styles from "./index.module.less";
import RangeInput, { RangeInputProps } from "./Range";
import { useDebounceEffect } from "ahooks";

export interface InputProps extends Omit<
  AntdInputProps,
  "onCompositionStart" | "onCompositionEnd" | "ref" | "onChange"
> {
  getRef?: (ref: InputRef | null) => void;
  onChange?: (value: string) => void;
  en?: boolean;
  word?: boolean;
  tooltip?: TooltipProps;
  escapeCharacters?: string[];
}

interface InputFC extends React.FC<InputProps> {
  Search: React.FC<SearchProps>;
  TextArea: React.FC<TextAreaProps>;
  Password: React.FC<PasswordProps>;
  Number: React.FC<InputNumberProps>;
  Range: React.FC<RangeInputProps>;
}

const Input: InputFC = (props) => {
  const {
    onChange,
    getRef,
    className,
    type,
    value,
    defaultValue,
    en = false,
    maxLength,
    disabled,
    placeholder,
    tooltip,
    escapeCharacters,
    ...inputConfig
  } = props;
  const [isComposing, setComposing] = useState<boolean>(false);
  const ref = useRef<InputRef>(null);

  // 处理转义：如果值中包含 escapeCharacters 中的字符，则在前面加上转义
  const escapeValue = useCallback(
    (val: string): string => {
      if (!escapeCharacters || escapeCharacters.length === 0) {
        return val;
      }

      let result = "";
      let i = 0;
      while (i < val.length) {
        const char = val[i];
        // 检查是否是转义字符，且下一个字符是需要转义的字符
        if (char === "\\" && i + 1 < val.length) {
          const nextChar = val[i + 1];
          // 如果下一个字符是需要转义的字符，说明已经转义过了，直接添加
          if (escapeCharacters.includes(nextChar)) {
            result += char + nextChar;
            i += 2;
            continue;
          }
        }
        // 如果当前字符是需要转义的字符，且前面没有转义符，则添加转义符
        if (escapeCharacters.includes(char)) {
          // 检查前面是否已经有转义符（避免重复转义）
          if (i === 0 || val[i - 1] !== "\\") {
            result += "\\" + char;
          } else {
            result += char;
          }
        } else {
          result += char;
        }
        i++;
      }
      return result;
    },
    [escapeCharacters],
  );

  // 处理去转义：如果值中包含转义格式，则去除转义
  const unescapeValue = useCallback(
    (val: string): string => {
      if (!escapeCharacters || escapeCharacters.length === 0) {
        return val;
      }

      let result = "";
      let i = 0;
      while (i < val.length) {
        const char = val[i];
        // 如果当前字符是反斜杠，且下一个字符是需要转义的字符
        if (char === "\\" && i + 1 < val.length) {
          const nextChar = val[i + 1];
          if (escapeCharacters.includes(nextChar)) {
            // 跳过反斜杠，只添加需要转义的字符
            result += nextChar;
            i += 2;
            continue;
          }
        }
        result += char;
        i++;
      }
      return result;
    },
    [escapeCharacters],
  );

  // 初始化时优先使用 value，其次使用 defaultValue
  const getInitialValue = () => {
    const rawValue =
      value !== undefined
        ? typeof value === "number"
          ? `${value}`
          : (value?.toString() ?? "")
        : defaultValue !== undefined
          ? typeof defaultValue === "number"
            ? `${defaultValue}`
            : (defaultValue?.toString() ?? "")
          : "";
    return unescapeValue(rawValue);
  };

  const initialValue = getInitialValue();

  const [_value, setValue] = useState<string>(initialValue);
  const [lastValue, setLastValue] = useState<string>(initialValue);
  const prevValueRef = useRef<typeof value>(undefined);

  useDebounceEffect(
    () => {
      if (!isComposing && _value !== lastValue) {
        const trimmedValue = _value.trim();
        const finalValue = trimmedValue === "" ? "" : _value;
        setLastValue(finalValue);
        // 如果设置了 escapeCharacters 且值匹配，则返回转义后的值
        const escapedValue = escapeValue(finalValue);
        onChange?.(escapedValue);
      }
    },
    [_value, isComposing, lastValue, onChange, escapeValue],
    {
      wait: 10,
    },
  );

  useEffect(() => {
    // 只在外部 value prop 真正变化时才更新内部状态
    if (prevValueRef.current !== value) {
      prevValueRef.current = value;

      if (value !== undefined) {
        const rawValue =
          typeof value === "number" ? `${value}` : value?.toString();
        // 去除转义后再显示
        const newValue = unescapeValue(rawValue);
        setValue(newValue);
        setLastValue(newValue);
      } else {
        // 只在初始化或外部主动设置为 undefined 时清空
        setValue("");
        setLastValue("");
      }
    }
  }, [value, unescapeValue]);

  useEffect(() => {
    getRef?.(ref.current);
  }, [getRef]);

  return (
    <Tooltip placement="topLeft" {...tooltip}>
      <AntdInput
        ref={ref}
        disabled={disabled}
        placeholder={disabled ? "" : placeholder}
        onCompositionStart={() => setComposing(true)}
        onCompositionEnd={() => {
          setTimeout(() => {
            setComposing(false);
          }, 1);
        }}
        value={_value}
        onChange={(e) => {
          // 用户输入时，先去除转义，然后再设置到状态中
          const inputValue = e.target.value;
          const unescapedInput = unescapeValue(inputValue);
          setValue(unescapedInput);
        }}
        className={classNames(styles.antdInput, className)}
        type={type}
        maxLength={en ? undefined : maxLength}
        allowClear={true}
        {...inputConfig}
      />
    </Tooltip>
  );
};

Input.Search = Search;
Input.TextArea = TextArea;
Input.Password = Password;
Input.Number = InputNumber;
Input.Range = RangeInput;

export default Input;
