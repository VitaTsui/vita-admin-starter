import { useEffect, useState } from "react";

interface UsePaginationSyncParams {
  current?: number;
  pageSize?: number;
}

/**
 * 分页状态同步 hook
 * 用于同步外部传入的 current 和 pageSize 到内部状态
 * 注意：只有明确传入 current/pageSize 时才会进行同步，undefined 时不受默认值影响
 */
const usePaginationSync = (params: UsePaginationSyncParams) => {
  const { current, pageSize } = params;

  const [_pageNum, setPageNum] = useState<number>(current ?? 1);
  const [_pageSize, setPageSize] = useState<number>(pageSize ?? 10);

  useEffect(() => {
    // 只有明确传入 current 时才同步
    if (current !== undefined && current !== _pageNum) {
      setPageNum(current);
    }
  }, [_pageNum, current]);

  useEffect(() => {
    // 只有明确传入 pageSize 时才同步
    if (pageSize !== undefined && pageSize !== _pageSize) {
      setPageSize(pageSize);
    }
  }, [_pageSize, pageSize]);

  return {
    _pageNum,
    _pageSize,
    setPageNum,
    setPageSize,
  };
};

export default usePaginationSync;
