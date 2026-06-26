import { useEffect, useState, Key, useMemo, useRef } from "react";
import { Equal } from "hsu-utils";
import { CheckedKeys, TreeData } from "..";
import { normalizeCheckedKeys } from "../_utils/normalizeCheckedKeys";

/**
 * 同步外部 expandedKeys 的 hook
 */
export const useExpandedKeys = (
  expandedKeysProps?: Key[],
  defaultExpandedKeys?: Key[]
) => {
  const [expandedKeys, setExpandedKeys] = useState<Key[] | undefined>(
    defaultExpandedKeys
  );
  const prevPropsRef = useRef<Key[] | undefined>(expandedKeysProps);
  const prevDefaultRef = useRef<Key[] | undefined>(defaultExpandedKeys);
  // 标记用户是否已手动操作过展开状态
  const hasUserInteractedRef = useRef(false);

  // 监听受控模式的 expandedKeysProps 变化
  useEffect(() => {
    if (
      expandedKeysProps !== undefined &&
      !Equal.ObjEqual(prevPropsRef.current, expandedKeysProps)
    ) {
      prevPropsRef.current = expandedKeysProps;
      setExpandedKeys(expandedKeysProps);
    }
  }, [expandedKeysProps]);

  // 监听 defaultExpandedKeys 变化（非受控模式下，用于响应异步数据加载）
  useEffect(() => {
    // 只有在非受控模式下，且用户未手动操作过，才响应 defaultExpandedKeys 变化
    if (
      expandedKeysProps === undefined &&
      !hasUserInteractedRef.current &&
      !Equal.ObjEqual(prevDefaultRef.current, defaultExpandedKeys)
    ) {
      prevDefaultRef.current = defaultExpandedKeys;
      setExpandedKeys(defaultExpandedKeys);
    }
  }, [defaultExpandedKeys, expandedKeysProps]);

  // 包装 setExpandedKeys，标记用户已手动操作
  const handleSetExpandedKeys = (
    keys: Key[] | undefined | ((prev: Key[] | undefined) => Key[] | undefined)
  ) => {
    hasUserInteractedRef.current = true;
    setExpandedKeys(keys);
  };

  return [expandedKeys, handleSetExpandedKeys] as const;
};

/**
 * 同步外部 checkedKeys 的 hook
 * 自动规范化：当父级在 checked 中但子项未全选时，将父级设为半选
 */
export const useCheckedKeys = (
  checkedKeysProps?: CheckedKeys,
  treeData?: TreeData[]
) => {
  // 规范化 checkedKeys
  const normalizedCheckedKeys = useMemo(() => {
    if (!checkedKeysProps || !treeData?.length) {
      return checkedKeysProps;
    }
    return normalizeCheckedKeys(checkedKeysProps, treeData);
  }, [checkedKeysProps, treeData]);

  const [checkedKeys, setCheckedKeys] = useState<CheckedKeys | undefined>(
    () => normalizedCheckedKeys
  );
  const prevNormalizedRef = useRef<CheckedKeys | undefined>(
    normalizedCheckedKeys
  );

  useEffect(() => {
    // 只有当规范化后的值真正变化时才更新
    if (
      normalizedCheckedKeys !== undefined &&
      !Equal.ObjEqual(prevNormalizedRef.current, normalizedCheckedKeys)
    ) {
      prevNormalizedRef.current = normalizedCheckedKeys;
      setCheckedKeys(normalizedCheckedKeys);
    }
  }, [normalizedCheckedKeys]);

  return [checkedKeys, setCheckedKeys] as const;
};
