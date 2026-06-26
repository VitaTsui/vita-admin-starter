import { useCallback, useMemo, useEffect, useState, Key, useRef } from "react";
import { TreeData } from "..";
import { filterTreeData } from "../_utils";

/**
 * 处理树搜索的 hook
 */
export const useTreeSearch = (
  treeData: TreeData[],
  setExpandedKeys: React.Dispatch<React.SetStateAction<Key[] | undefined>>
) => {
  const [searchKey, setSearchKey] = useState<string>("");
  const prevSearchKeyRef = useRef<string>("");

  // 处理树数据（搜索过滤）
  // filterTreeData 内部已经处理了数据拷贝，无需额外 cloneDeep
  const filteredTreeData = useMemo(() => {
    if (!searchKey.trim()) {
      return treeData;
    }
    return filterTreeData(searchKey, treeData);
  }, [searchKey, treeData]);

  // 处理搜索时的展开逻辑
  useEffect(() => {
    const trimmedSearchKey = searchKey.trim();
    const prevTrimmedKey = prevSearchKeyRef.current.trim();

    // 如果搜索关键词没有变化，跳过处理
    if (trimmedSearchKey === prevTrimmedKey) {
      return;
    }

    prevSearchKeyRef.current = searchKey;

    // 清空搜索时，重置展开状态
    if (!trimmedSearchKey) {
      setExpandedKeys([]);
      return;
    }

    // 有搜索关键词时，展开所有匹配的节点
    if (!filteredTreeData.length) {
      return;
    }

    const keysToExpandSet = new Set<Key>();
    const collectExpandKeys = (nodes: TreeData[]): void => {
      for (const node of nodes) {
        if (node.children?.length) {
          keysToExpandSet.add(node.key);
          collectExpandKeys(node.children);
        }
      }
    };

    collectExpandKeys(filteredTreeData);

    if (keysToExpandSet.size > 0) {
      setExpandedKeys((prev) => {
        const prevSet = new Set(prev ?? []);
        keysToExpandSet?.forEach((key) => prevSet.add(key));
        return Array.from(prevSet);
      });
    }
  }, [searchKey, filteredTreeData, setExpandedKeys]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchKey(value);
  }, []);

  return {
    searchKey,
    handleSearchChange,
    filteredTreeData,
  };
};
