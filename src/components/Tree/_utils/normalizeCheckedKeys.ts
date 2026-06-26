import { Key } from "react";
import { TreeData, CheckedKeys } from "..";
import { getAllChildrenKeys } from ".";

/**
 * 规范化 checkedKeys：检查父节点，如果子项未全选，将父节点设为半选
 * @param checkedKeys 待规范化的 checkedKeys
 * @param treeData 树数据
 * @returns 规范化后的 checkedKeys
 */
export const normalizeCheckedKeys = (
  checkedKeys: CheckedKeys | undefined,
  treeData: TreeData[]
): CheckedKeys | undefined => {
  if (!checkedKeys || !treeData.length) {
    return checkedKeys;
  }

  // 如果是数组格式，转换为对象格式
  const checkedSet = new Set<Key>();
  const halfCheckedSet = new Set<Key>();

  if (Array.isArray(checkedKeys)) {
    checkedKeys?.forEach((key) => checkedSet.add(key));
  } else {
    checkedKeys.checked?.forEach((key) => checkedSet.add(key));
    (checkedKeys.halfChecked || [])?.forEach((key) => halfCheckedSet.add(key));
  }

  // 递归遍历所有节点，检查父节点状态
  // 从最底层开始处理，确保父节点的状态基于子节点的正确状态
  const processNode = (node: TreeData): void => {
    // 先递归处理子节点（从最底层开始）
    if (node.children?.length) {
      for (const child of node.children) {
        processNode(child);
      }
    }

    // 然后处理当前节点（父节点）
    // 如果节点在 checked 中，且有子节点
    if (checkedSet.has(node.key) && node.children?.length) {
      // 获取所有子节点的 key
      const allChildrenKeys = getAllChildrenKeys(node.children);

      // 检查所有子节点是否都被勾选
      if (allChildrenKeys.length > 0) {
        const allChildrenChecked = allChildrenKeys.every((childKey) =>
          checkedSet.has(childKey)
        );

        if (!allChildrenChecked) {
          // 如果子节点未全选，将父节点从 checked 中移除，添加到 halfChecked
          checkedSet.delete(node.key);
          halfCheckedSet.add(node.key);
        } else {
          // 如果所有子节点都被勾选，确保父节点不在 halfChecked 中
          halfCheckedSet.delete(node.key);
        }
      }
    }
  };

  // 遍历所有根节点
  for (const node of treeData) {
    processNode(node);
  }

  // 返回规范化后的 checkedKeys
  return {
    checked: Array.from(checkedSet),
    halfChecked: Array.from(halfCheckedSet),
  };
};
