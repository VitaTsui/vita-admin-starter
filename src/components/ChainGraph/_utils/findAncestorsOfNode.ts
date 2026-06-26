import { TreeGraphData } from "..";

/**
 * 树结构找节点所有父节点
 * @param tree 树数据
 * @param targetNodeId 目标节点ID
 * @param childrenKey 子节点键名，默认为 "children"
 * @returns 祖先节点ID数组
 */
export function findAncestorsOfNode(
  tree: TreeGraphData,
  targetNodeId: string,
  childrenKey: string = "children"
): string[] {
  let ancestors: string[] = [];

  function traverse(node: TreeGraphData) {
    if (node.id === targetNodeId) {
      // 找到目标节点
      ancestors = [...ancestors, node.id]; // 将目标节点添加到祖先列表中（可选，取决于是否需要包含目标节点自身）
      return true; // 停止遍历
    }

    // 递归遍历子节点
    if (node[childrenKey] && (node[childrenKey] as TreeGraphData[]).length) {
      (node[childrenKey] as TreeGraphData[])?.forEach(
        (child: TreeGraphData) => {
          if (traverse(child)) {
            ancestors.push(node.id); // 如果子节点中找到了目标节点，将当前节点添加到祖先列表
            return true; // 停止遍历
          }
        }
      );
    }

    return false; // 未找到目标节点
  }

  traverse(tree);

  return ancestors;
}
