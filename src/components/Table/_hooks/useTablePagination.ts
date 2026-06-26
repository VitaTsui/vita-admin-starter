import { useCallback, useEffect, useMemo, useState } from "react";
import { Equal } from "hsu-utils";
import { PaginationProps } from "../_components/Pagination";
import { TableProps } from "..";
import { AnyObject } from "antd/es/_util/type";
import usePaginationSync from "./usePaginationSync";

interface UseTablePaginationParams<T extends AnyObject> {
  dataSource?: TableProps<T>["dataSource"];
  pagination?: false | PaginationProps;
  staticDataSource?: boolean;
  current?: number;
  pageSize?: number;
  onChangePage?: (page: number, pageSize: number) => void;
  onShowSizeChange?: (page: number, pageSize: number) => void;
  onStaticPaginationChange?: (page: number, pageSize: number) => void;
}

const useTablePagination = <T extends AnyObject>(
  params: UseTablePaginationParams<T>
) => {
  const {
    dataSource,
    pagination,
    staticDataSource = false,
    onChangePage,
    onShowSizeChange,
    onStaticPaginationChange,
  } = params;

  // 直接传入原始值，不使用默认值，让 usePaginationSync 自行处理
  const { _pageNum, _pageSize, setPageNum, setPageSize } = usePaginationSync({
    current: params.current,
    pageSize: params.pageSize,
  });
  const [_dataSource, setDataSource] = useState<typeof dataSource>([]);

  useEffect(() => {
    if (!Equal.ObjEqual(dataSource, _dataSource)) {
      setDataSource(dataSource);

      if (staticDataSource) {
        setPageNum(1);
      }
    }
  }, [_dataSource, dataSource, staticDataSource, setPageNum]);

  // 计算分页数据源
  const paginatedDataSource = useMemo(() => {
    if (!pagination) return dataSource;
    if (staticDataSource) {
      const start = _pageSize * (_pageNum - 1);
      return _dataSource?.slice(start, start + _pageSize);
    }
    return dataSource;
  }, [
    pagination,
    staticDataSource,
    _dataSource,
    _pageSize,
    _pageNum,
    dataSource,
  ]);

  // 计算用于合并行的数据源
  const mergeRowDataSource = useMemo(() => {
    if (!pagination) return dataSource;
    const start = _pageSize * (_pageNum - 1);
    return _dataSource?.slice(start, start + _pageSize);
  }, [pagination, _dataSource, _pageSize, _pageNum, dataSource]);

  // 处理分页变化
  const handlePageChange = useCallback(
    (num: number, size: number) => {
      setPageNum(num);
      setPageSize(size);
      onChangePage?.(num, size);
      // 当使用 staticDataSource 时，通过 onStaticPaginationChange 传递变化
      if (staticDataSource) {
        onStaticPaginationChange?.(num, size);
      }
    },
    [
      onChangePage,
      onStaticPaginationChange,
      staticDataSource,
      setPageNum,
      setPageSize,
    ]
  );

  // 处理分页大小变化
  const handlePageSizeChange = useCallback(
    (page: number, size: number) => {
      setPageNum(page);
      setPageSize(size);
      onShowSizeChange?.(page, size);
      // 当使用 staticDataSource 时，通过 onStaticPaginationChange 传递变化
      if (staticDataSource) {
        onStaticPaginationChange?.(page, size);
      }
    },
    [
      onShowSizeChange,
      onStaticPaginationChange,
      staticDataSource,
      setPageNum,
      setPageSize,
    ]
  );

  return {
    _pageNum,
    _pageSize,
    _dataSource,
    setPageNum,
    setPageSize,
    paginatedDataSource,
    mergeRowDataSource,
    handlePageChange,
    handlePageSizeChange,
  };
};

export default useTablePagination;
