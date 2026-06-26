import {
  InputNumber as AntdInputNumber,
  InputNumberProps as AntdInputNumberProps,
} from "antd";
import React, { useEffect, useRef, useState } from "react";
import { CloseCircleFilled } from "@ant-design/icons";

import classNames from "classnames";
import styles from "./index.module.less";
import { useDebounceEffect } from "ahooks";

export interface InputNumberProps extends Omit<
  AntdInputNumberProps,
  "ref" | "onChange" | "value"
> {
  getRef?: (ref: HTMLInputElement | null) => void;
  onChange?: (value: string) => void;
  value?: string;
  allowClear?: boolean;
  wrapperClassName?: string;
}

const InputNumber: React.FC<InputNumberProps> = (props) => {
  const {
    onChange,
    getRef,
    value,
    defaultValue,
    className,
    disabled,
    allowClear = true,
    addonAfter,
    wrapperClassName,
    ...inputConfig
  } = props;
  const ref = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 初始化时优先使用 value，其次使用 defaultValue
  const initialValue =
    value !== undefined
      ? typeof value === "number"
        ? `${value}`
        : (value?.toString() ?? "")
      : defaultValue !== undefined
        ? typeof defaultValue === "number"
          ? `${defaultValue}`
          : (defaultValue?.toString() ?? "")
        : "";

  const [_value, setValue] = useState<string>(initialValue);
  const [lastValue, setLastValue] = useState<string>(initialValue);
  const prevValueRef = useRef<typeof value>(undefined);

  useDebounceEffect(
    () => {
      if (_value !== lastValue) {
        setLastValue(_value);

        onChange?.(_value);
      }
    },
    [_value, lastValue, onChange],
    {
      wait: 10,
    },
  );

  useEffect(() => {
    // 只在外部 value prop 真正变化时才更新内部状态
    if (prevValueRef.current !== value) {
      prevValueRef.current = value;

      if (value !== undefined) {
        const newValue =
          typeof value === "number" ? `${value}` : value?.toString();
        setValue(newValue);
        setLastValue(newValue);
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

  // 动态计算 addonAfter 的宽度，并设置 CSS 变量
  useEffect(() => {
    if (addonAfter && wrapperRef.current) {
      const updateAddonWidth = () => {
        const addonElement = wrapperRef.current?.querySelector(
          ".ant-input-number-group-addon",
        ) as HTMLElement | null;
        if (addonElement && addonElement.offsetWidth > 0) {
          wrapperRef.current?.style.setProperty(
            "--addon-after-width",
            `${addonElement.offsetWidth}px`,
          );
        }
      };

      // 使用 requestAnimationFrame 确保 DOM 渲染完成后再计算
      const rafId = requestAnimationFrame(() => {
        updateAddonWidth();
      });

      // 监听窗口大小变化和元素大小变化，重新计算
      const resizeObserver = new ResizeObserver(() => {
        updateAddonWidth();
      });

      if (wrapperRef.current) {
        const addonElement = wrapperRef.current.querySelector(
          ".ant-input-number-group-addon",
        ) as HTMLElement | null;
        if (addonElement) {
          resizeObserver.observe(addonElement);
        }
      }

      return () => {
        cancelAnimationFrame(rafId);
        resizeObserver.disconnect();
      };
    }
  }, [addonAfter]);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setValue("");
    setLastValue("");
    onChange?.("");
  };

  const showClear =
    allowClear && _value !== "" && _value !== undefined && !disabled;

  return (
    <div
      ref={wrapperRef}
      className={classNames(styles.inputNumberWrapper, wrapperClassName, {
        [styles.inputNumberWrapperClear]: showClear,
        [styles.hasAddonAfter]: !!addonAfter,
      })}
    >
      <AntdInputNumber
        ref={ref}
        value={_value}
        onChange={(e) => {
          const newValue =
            e === null || e === undefined
              ? ""
              : (typeof e === "number" ? e : e || "").toString();
          setValue(newValue);
        }}
        className={classNames(styles.antdInput, className)}
        controls={false}
        disabled={disabled}
        addonAfter={addonAfter}
        {...inputConfig}
        stringMode
      />
      {showClear && (
        <CloseCircleFilled className={styles.clearIcon} onClick={handleClear} />
      )}
    </div>
  );
};

export default InputNumber;
