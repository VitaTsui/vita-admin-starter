import { DataNode, SafeKey } from "rc-tree-select/lib/interface";

/**
 * 根据默认展开层级计算应该展开的节点 keys（用于 TreeSelect）
 * @param treeData 树数据（DataNode 类型）
 * @param level 展开层级（从 1 开始，1 表示第一层，2 表示第二层，以此类推）
 * @returns 应该展开的节点 keys 数组
 */
export const getExpandedKeysByLevel = (
  treeData: DataNode[],
  level: number
): SafeKey[] => {
  if (level < 1 || !treeData?.length) {
    return [];
  }

  const expandedKeys: SafeKey[] = [];

  const traverse = (nodes: DataNode[], currentLevel: number) => {
    for (const node of nodes) {
      // 如果当前层级小于目标层级，则展开该节点
      if (currentLevel < level && node.children?.length && node.key !== undefined) {
        expandedKeys.push(node.key as SafeKey);
        traverse(node.children, currentLevel + 1);
      }
    }
  };

  traverse(treeData, 1);
  return expandedKeys;
};

