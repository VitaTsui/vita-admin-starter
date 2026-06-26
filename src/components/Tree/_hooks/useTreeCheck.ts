import { useCallback } from "react";
import { TreeProps as AntdTreeProps } from "antd";
import { CheckedKeys } from "..";

/**
 * 处理树勾选的 hook
 * 使用 antd 默认逻辑，不做额外操作
 */
export const useTreeCheck = (
  setCheckedKeys: React.Dispatch<React.SetStateAction<CheckedKeys | undefined>>,
  onCheck?: AntdTreeProps["onCheck"],
  onChange?: (checked: CheckedKeys) => void
) => {
  // 处理勾选逻辑：直接使用 antd 的默认行为
  const handleCheck = useCallback(
    (
      checked: CheckedKeys,
      info: Parameters<NonNullable<AntdTreeProps["onCheck"]>>[1]
    ) => {
      setCheckedKeys(checked);
      onCheck?.(checked, info);

      // 触发 onChange 回调
      if (onChange) {
        if (Array.isArray(checked)) {
          onChange({
            checked,
            halfChecked: info.halfCheckedKeys || [],
          });
        } else {
          onChange(checked);
        }
      }
    },
    [setCheckedKeys, onCheck, onChange]
  );

  return handleCheck;
};
