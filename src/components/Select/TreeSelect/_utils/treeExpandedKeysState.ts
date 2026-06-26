import { TreeSelectProps as AntdTreeSelectProps } from "antd";
import { Equal } from "hsu-utils";

export type TreeExpandedKeys = AntdTreeSelectProps["treeExpandedKeys"];

export const getInitialTreeExpandedKeys = (
  treeExpandedKeysProps: TreeExpandedKeys,
  treeDefaultExpandedKeys: TreeExpandedKeys,
  defaultExpandLevelKeys: TreeExpandedKeys,
): TreeExpandedKeys =>
  treeExpandedKeysProps ?? treeDefaultExpandedKeys ?? defaultExpandLevelKeys;

export const shouldSyncControlledExpandedKeys = (
  prevKeys: TreeExpandedKeys,
  nextKeys: TreeExpandedKeys,
): boolean => nextKeys !== undefined && !Equal.ObjEqual(prevKeys, nextKeys);

export const shouldApplyTreeDefaultExpandedKeys = (
  treeExpandedKeysProps: TreeExpandedKeys,
  hasUserInteracted: boolean,
  treeDefaultExpandedKeys: TreeExpandedKeys,
  hasAppliedTreeDefault: boolean,
): boolean =>
  treeExpandedKeysProps === undefined &&
  !hasUserInteracted &&
  treeDefaultExpandedKeys !== undefined &&
  !hasAppliedTreeDefault;

export const shouldSyncDefaultExpandLevelKeys = (
  treeExpandedKeysProps: TreeExpandedKeys,
  hasUserInteracted: boolean,
  hasAppliedTreeDefault: boolean,
  prevDefaultKeys: TreeExpandedKeys,
  nextDefaultKeys: TreeExpandedKeys,
): boolean =>
  treeExpandedKeysProps === undefined &&
  !hasUserInteracted &&
  !hasAppliedTreeDefault &&
  !Equal.ObjEqual(prevDefaultKeys, nextDefaultKeys);
