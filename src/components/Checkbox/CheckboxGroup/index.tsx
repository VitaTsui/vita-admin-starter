import { Checkbox } from "antd";
import {
  CheckboxGroupProps as AntdCheckboxGroupProps,
  CheckboxOptionType,
} from "antd/es/checkbox";
import React, { useMemo, useCallback } from "react";
import classNames from "classnames";
import styles from "./index.module.less";

const Group = Checkbox.Group;

export interface CheckboxGroupProps extends AntdCheckboxGroupProps {
  outline?: boolean;
  hasAll?: boolean;
  layout?: "vertical" | "horizontal";
  allMaxHeight?: number;
}

const CheckboxGroup: React.FC<CheckboxGroupProps> = (props) => {
  const {
    className,
    outline,
    hasAll,
    options = [],
    value,
    onChange,
    layout = "horizontal",
    allMaxHeight,
    ...rest
  } = props;

  // 获取所有非"全部"选项的值
  const normalValues = useMemo(() => {
    return options?.map((option) => {
      if (typeof option === "string" || typeof option === "number") {
        return option;
      }
      return (option as CheckboxOptionType).value;
    });
  }, [options]);

  // 计算"全部"选项的状态
  const allChecked = useMemo(() => {
    if (!hasAll || !value || normalValues.length === 0) return false;
    const selectedValues = Array.isArray(value) ? value : [];
    return (
      normalValues.length > 0 &&
      normalValues.every((val) => selectedValues.includes(val))
    );
  }, [hasAll, value, normalValues]);

  const allIndeterminate = useMemo(() => {
    if (!hasAll || !value || normalValues.length === 0) return false;
    const selectedValues = Array.isArray(value) ? value : [];
    const selectedCount = normalValues.filter((val) =>
      selectedValues.includes(val)
    ).length;
    return selectedCount > 0 && selectedCount < normalValues.length;
  }, [hasAll, value, normalValues]);

  // 处理"全部"选项的点击
  const handleAllChange = useCallback(
    (e: { target: { checked: boolean } }) => {
      if (!onChange) return;

      if (e.target.checked) {
        // 选中所有选项
        onChange(normalValues);
      } else {
        // 取消所有选项
        onChange([]);
      }
    },
    [onChange, normalValues]
  );

  // 处理普通选项的点击
  const handleChange = useCallback(
    (checkedValues: (string | number)[]) => {
      if (!onChange) return;
      onChange(checkedValues);
    },
    [onChange]
  );

  if (hasAll) {
    return (
      <div
        className={classNames(styles.checkboxGroup, className, {
          [styles.outline]: outline,
          [styles.hasAll]: hasAll,
        })}
        style={{ maxHeight: allMaxHeight ? `${allMaxHeight}px` : undefined }}
      >
        {!!options.length && (
          <Checkbox
            checked={allChecked}
            indeterminate={allIndeterminate}
            onChange={handleAllChange}
            className={styles.allCheckbox}
          >
            全选
          </Checkbox>
        )}
        <Group
          options={options}
          value={value}
          onChange={handleChange}
          {...rest}
        />
      </div>
    );
  }

  return (
    <Group
      className={classNames(styles.checkboxGroup, className, {
        [styles.outline]: outline,
        [styles[layout]]: layout,
      })}
      options={options}
      value={value}
      onChange={onChange}
      {...rest}
    />
  );
};

export default CheckboxGroup;
