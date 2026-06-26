import { Key } from "react";
import { TreeData } from "..";

/**
 * 获取节点的所有子节点 key
 * @param children 子节点数组
 * @returns 所有子节点的 key 数组
 */
export const getAllChildrenKeys = (children: TreeData[]): Key[] => {
  const keys: Key[] = [];
  const traverse = (nodes: TreeData[]) => {
    for (const node of nodes) {
      keys.push(node.key);
      if (node.children?.length) {
        traverse(node.children);
      }
    }
  };
  traverse(children);
  return keys;
};

/**
 * 在树中查找节点的所有父级节点 key
 * @param targetKey 目标节点的 key
 * @param treeData 树数据
 * @param parentKeys 父级节点 key 数组（递归使用）
 * @returns 所有父级节点的 key 数组，如果未找到则返回空数组
 */
export const getAllParentKeys = (
  targetKey: Key,
  treeData: TreeData[],
  parentKeys: Key[] = []
): Key[] => {
  for (const node of treeData) {
    if (node.key === targetKey) {
      return parentKeys;
    }
    if (node.children?.length) {
      const newParentKeys = [...parentKeys, node.key];
      const found = getAllParentKeys(targetKey, node.children, newParentKeys);
      // 如果找到了（返回的数组长度大于0或等于newParentKeys），说明在子树中找到了
      if (found.length > 0) {
        return found;
      }
    }
  }
  return [];
};

/**
 * 根据 key 查找节点
 * @param targetKey 目标节点的 key
 * @param data 树数据
 * @returns 找到的节点或 null
 */
export const findNodeByKey = (
  targetKey: Key,
  data: TreeData[]
): TreeData | null => {
  for (const node of data) {
    if (node.key === targetKey) {
      return node;
    }
    if (node.children) {
      const found = findNodeByKey(targetKey, node.children);
      if (found) return found;
    }
  }
  return null;
};

/**
 * 搜索过滤树数据
 * @param searchKey 搜索关键词
 * @param data 树数据
 * @returns 过滤后的树数据
 */
export const filterTreeData = (
  searchKey: string,
  data: TreeData[]
): TreeData[] => {
  if (!searchKey.trim()) return data;

  const result: TreeData[] = [];
  const lowerSearchKey = searchKey.toLowerCase();

  for (const item of data) {
    const matchesTitle = item.title.toLowerCase().includes(lowerSearchKey);
    const filteredChildren = item.children?.length
      ? filterTreeData(searchKey, item.children)
      : undefined;

    if (matchesTitle || filteredChildren?.length) {
      result.push({
        ...item,
        children: filteredChildren?.length ? filteredChildren : undefined,
      });
    }
  }

  return result;
};

/**
 * 根据默认展开层级计算应该展开的节点 keys
 * @param treeData 树数据
 * @param level 展开层级（从 1 开始，1 表示第一层，2 表示第二层，以此类推）
 * @returns 应该展开的节点 keys 数组
 */
export const getExpandedKeysByLevel = (
  treeData: TreeData[],
  level: number
): Key[] => {
  if (level < 1 || !treeData?.length) {
    return [];
  }

  const expandedKeys: Key[] = [];

  const traverse = (nodes: TreeData[], currentLevel: number) => {
    for (const node of nodes) {
      // 如果当前层级小于等于目标层级，则展开该节点
      if (currentLevel <= level && node.children?.length) {
        expandedKeys.push(node.key);
        traverse(node.children, currentLevel + 1);
      }
    }
  };

  traverse(treeData, 1);

  return expandedKeys;
};

/**
 * 获取节点的完整路径（从根节点到当前节点）
 * @param targetKey 目标节点的 key
 * @param treeData 树数据
 * @returns 节点路径数组，包含从根节点到目标节点的所有节点信息；如果未找到则返回 null
 */
export const getNodePath = (
  targetKey: Key,
  treeData: TreeData[]
): TreeData[] | null => {
  const findPath = (
    nodes: TreeData[],
    path: TreeData[] = []
  ): TreeData[] | null => {
    for (const node of nodes) {
      const currentPath = [...path, node];
      
      // 找到目标节点
      if (node.key === targetKey) {
        return currentPath;
      }
      
      // 在子节点中继续查找
      if (node.children?.length) {
        const found = findPath(node.children, currentPath);
        if (found) {
          return found;
        }
      }
    }
    return null;
  };

  return findPath(treeData);
};
