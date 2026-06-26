import AntdTextArea, {
  TextAreaProps as AntdTextAreaProps,
  TextAreaRef,
} from "antd/es/input/TextArea";
import React, { ReactNode, useEffect, useRef, useState } from "react";

import classNames from "classnames";
import styles from "./index.module.less";

export interface TextAreaProps
  extends Omit<
    AntdTextAreaProps,
    "onCompositionStart" | "onCompositionEnd" | "ref" | "prefix" | "onChange"
  > {
  getRef?: (ref: TextAreaRef | null) => void;
  textAreaClassName?: string;
  suffix?: ReactNode;
  prefix?: ReactNode;
  onChange?: (value: string) => void;
  en?: boolean;
  text?: boolean;
  word?: boolean;
}

const TextArea: React.FC<TextAreaProps> = (props) => {
  const {
    onChange,
    getRef,
    className,
    onFocus,
    onBlur,
    textAreaClassName,
    prefix,
    suffix,
    value,
    defaultValue,
    disabled,
    en = false,
    maxLength,
    text,
    placeholder,
    autoSize,
    style,
    ...inputConfig
  } = props;
  const [isComposing, setComposing] = useState<boolean>(false);
  const ref = useRef<TextAreaRef>(null);
  const [focused, setFocused] = useState<boolean>(false);

  // 初始化时优先使用 value，其次使用 defaultValue
  const initialValue =
    value !== undefined
      ? value?.toString() ?? ""
      : defaultValue !== undefined
      ? defaultValue?.toString() ?? ""
      : "";

  const [_value, setValue] = useState<string>(initialValue);
  const [lastValue, setLastValue] = useState<string>(initialValue);
  const [hasError, setHasError] = useState<boolean>(false);
  const prevValueRef = useRef<typeof value>(undefined);

  useEffect(() => {
    if (!isComposing && _value !== lastValue) {
      const trimmedValue = _value.trim();
      const finalValue = trimmedValue === "" ? "" : _value;
      setLastValue(finalValue);
      onChange?.(finalValue);
    }
  }, [isComposing, onChange, _value, lastValue]);

  useEffect(() => {
    // 只在外部 value prop 真正变化时才更新内部状态
    if (prevValueRef.current !== value) {
      prevValueRef.current = value;

      if (value !== undefined) {
        setValue(value?.toString());
        setLastValue(value?.toString());
      } else {
        // 只在初始化或外部主动设置为 undefined 时清空
        setValue("");
        setLastValue("");
      }
    }
  }, [value]);

  useEffect(() => {
    getRef?.(ref.current);
  }, [getRef]);

  useEffect(() => {
    // 使用 MutationObserver 监听错误状态变化
    const checkError = () => {
      if (ref.current?.resizableTextArea?.textArea) {
        const textAreaElement = ref.current.resizableTextArea.textArea;
        const hasErrorClass = textAreaElement.classList.contains(
          "ant-input-status-error"
        );
        setHasError(hasErrorClass);
      }
    };

    // 初始检查
    checkError();

    // 监听 DOM 变化
    if (ref.current?.resizableTextArea?.textArea) {
      const textAreaElement = ref.current.resizableTextArea.textArea;
      const observer = new MutationObserver(checkError);

      observer.observe(textAreaElement, {
        attributes: true,
        attributeFilter: ["class"],
      });

      return () => {
        observer.disconnect();
      };
    }
  }, []);

  return (
    <div
      className={classNames({
        [styles.textarea]: true,
        [className ?? ""]: true,
        [styles.focused]: focused,
        [styles.disabled]: disabled,
        [styles.text]: text,
        [styles.hasError]: hasError,
      })}
      style={style}
    >
      {prefix}
      <AntdTextArea
        ref={ref}
        onCompositionStart={() => setComposing(true)}
        onCompositionEnd={() => {
          setTimeout(() => {
            setComposing(false);
          }, 1);
        }}
        value={_value}
        autoSize={disabled && text ? autoSize || { minRows: 1 } : autoSize}
        onChange={(e) => {
          setValue(e.target.value);
        }}
        onFocus={(e) => {
          setFocused(true);

          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);

          onBlur?.(e);
        }}
        className={`${styles.antd_textarea} ${textAreaClassName ?? ""}`}
        disabled={disabled}
        placeholder={disabled ? "" : placeholder}
        maxLength={en ? undefined : maxLength}
        {...inputConfig}
      />
      {suffix}
    </div>
  );
};

export default TextArea;
