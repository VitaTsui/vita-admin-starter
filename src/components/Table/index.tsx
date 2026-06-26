import {
  ColumnType as AntColumnType,
  ColumnGroupType as AntColumnGroupType,
} from "antd/lib/table";
import {
  Table as AntdTable,
  TableProps as AntdTableProps,
  TooltipProps,
} from "antd";
import Drag, { DragProps } from "./_components/Drag";
import Pagination, { PaginationProps } from "./_components/Pagination";
import React, { CSSProperties, ReactNode, useMemo, useRef } from "react";

import { AnyObject } from "antd/es/_util/type";
import { generateRandomStr } from "hsu-utils";
import classNames from "classnames";
import styles from "./index.module.less";
import useHideHeaderScrollbar from "./_hooks/useHideHeaderScrollbar";
import useSetTableHeight from "./_hooks/useSetTableHeight";
import { ColumnTitleProps } from "antd/lib/table/interface";
import useAutoScrolling from "./_hooks/useAutoScrolling";
import useScrollEnd from "./_hooks/useScrollEnd";
import useEllipsisTooltip from "./_hooks/useEllipsisTooltip";
import useTablePagination from "./_hooks/useTablePagination";
import useTableColumns from "./_hooks/useTableColumns";

export { Drag as TableDrag };

export interface EllipsisTooltipConfig
  extends Omit<TooltipProps, "title" | "children"> {
  ellipsisPosition?: "start" | "end";
  defaultWidth?: number; // 默认 Tooltip 宽度（当列没有设置宽度时使用）
}

export interface ColumnType<RecordType> extends AntColumnType<RecordType> {
  title?: string;
  renderTitle?: (title: string) => ReactNode;
  titleSort?: (props: ColumnTitleProps<RecordType>) => ReactNode;
  dataIndex?: string;
  hidden?: boolean;
  sort?: number;
  hasPermi?: string[];
  children?: ColumnType<RecordType>[];
  mergeRow?: boolean;
  help?: string;
  orderKey?: string;
  fixedWidth?: boolean;
  ellipsisPosition?: "start" | "end";
}
export interface ColumnsGroupType<RecordType>
  extends Omit<AntColumnGroupType<RecordType>, "children"> {
  title?: string;
  renderTitle?: (title: string) => ReactNode;
  titleSort?: (props: ColumnTitleProps<RecordType>) => ReactNode;
  dataIndex?: string;
  hidden?: boolean;
  sort?: number;
  hasPermi?: string[];
  children?: ColumnsGroupType<RecordType>[];
  mergeRow?: boolean;
  help?: string;
  orderKey?: string;
  fixedWidth?: boolean;
  ellipsisPosition?: "start" | "end";
}
export type ColumnsType<RecordType = AnyObject> = (
  | ColumnType<RecordType>
  | ColumnsGroupType<RecordType>
)[];

export interface TableProps<RecordType = AnyObject>
  extends Omit<
    AntdTableProps<RecordType>,
    "scroll" | "pagination" | "columns"
  > {
  columns?: ColumnsType<RecordType>;
  scroll?: boolean | { y: boolean };
  autoWidth?: boolean;
  scrollAutoHeight?: boolean;
  hideScrollbar?: boolean;
  thPadding?: string;
  tdPadding?: string;
  expandedCellPadding?: string;
  pagination?: false | PaginationProps;
  onDragEnd?: DragProps["onDragEnd"];
  tableClassName?: string;
  fillPanel?: boolean;
  staticDataSource?: boolean;
  antdTableClassName?: string;
  autoScrolling?: boolean;
  autoScrollingInterval?: number;
  /** smooth 模式自动滚动速度，单位 px/s，默认 25 */
  autoScrollingSpeed?: number;
  autoScrollMode?: "smooth" | "row";
  /** 自动滚动到末尾后是否循环回到顶部，默认 true */
  autoScrollLoop?: boolean;
  /** 循环模式："reset" 回到顶部重新滚动（默认），"seamless" 无缝衔接继续滚动 */
  autoScrollLoopMode?: "reset" | "seamless";
  /** 自动滚动偏移量阈值（px），可滚动溢出超过该值后才启动自动滚动，默认 0 */
  autoScrollingOffset?: number;
  hideEmpty?: boolean;
  ellipsisTooltipConfig?: EllipsisTooltipConfig;
  serialNumberColumn?: boolean;
  onAutoScrollEndAdd?: () => Promise<boolean>;
  onScrollEnd?: () => void;
  order?: { k: string; t: "asc" | "desc" };
  onOrderChange?: (order?: { k: string; t: "asc" | "desc" }) => void;
  sorter?: boolean;
  showTotal?: false | ((total: number, range: [number, number]) => ReactNode);
  isExpandedCellTable?: boolean;
}

type TableFC = (<T extends AnyObject>(
  props: TableProps<T>
) => JSX.Element | null) &
  React.FC<TableProps<AnyObject>>;

const Table: TableFC = <T extends AnyObject>(props: TableProps<T>) => {
  const {
    scroll = false,
    pagination = {},
    className,
    dataSource,
    columns = [],
    autoWidth,
    expandable = {},
    scrollAutoHeight = true,
    hideScrollbar = true,
    thPadding,
    tdPadding,
    expandedCellPadding,
    onDragEnd,
    tableClassName,
    fillPanel,
    staticDataSource = false,
    id,
    antdTableClassName,
    autoScrolling,
    autoScrollingInterval: interval,
    autoScrollingSpeed,
    autoScrollMode,
    autoScrollLoop = true,
    autoScrollLoopMode,
    autoScrollingOffset,
    hideEmpty = false,
    ellipsisTooltipConfig,
    serialNumberColumn = false,
    onAutoScrollEndAdd,
    onScrollEnd,
    bordered,
    order,
    onOrderChange,
    onChange,
    sorter,
    virtual,
    showTotal,
    rowSelection,
    isExpandedCellTable = false,
    ...TableConfig
  } = props;
  const {
    pageSize,
    current,
    total,
    onChange: onChangePage,
    onShowSizeChange,
    onStaticPaginationChange,
    ...paginationConfig
  } = typeof pagination === "boolean" ? ({} as PaginationProps) : pagination;
  const ref = useRef<HTMLDivElement>(null);
  const cls = useMemo(() => generateRandomStr(10), []);

  const { enhanceColumns } = useEllipsisTooltip<T>(ellipsisTooltipConfig);

  const {
    _pageNum,
    _pageSize,
    paginatedDataSource,
    mergeRowDataSource,
    handlePageChange,
    handlePageSizeChange,
  } = useTablePagination({
    dataSource,
    pagination,
    staticDataSource,
    current,
    pageSize,
    onChangePage,
    onShowSizeChange,
    onStaticPaginationChange,
  });

  const { _columns, renderedColumns, handleTableChange } = useTableColumns({
    columns,
    scroll,
    autoWidth,
    dataSource,
    enhanceColumns,
    serialNumberColumn,
    pagination,
    _pageNum,
    _pageSize,
    order,
    mergeRowDataSource,
    onChange,
    onOrderChange,
    sorter,
    ref,
    cls,
    bordered,
    rowSelection,
    expandable,
  });

  useSetTableHeight({
    pagination,
    scroll,
    scrollAutoHeight,
    ref,
    dataSource,
    cls,
    fillPanel,
    columns: _columns,
    bordered,
    virtual,
  });

  useHideHeaderScrollbar({
    hideScrollbar,
    cls,
    ref,
    scroll,
    bordered,
  });

  useAutoScrolling({
    cls,
    autoScrolling,
    ref,
    dataSource,
    interval,
    autoScrollingSpeed,
    onAutoScrollEndAdd,
    autoScrollMode,
    autoScrollLoop,
    autoScrollLoopMode,
    autoScrollingOffset,
  });

  useScrollEnd({
    cls,
    ref,
    dataSource,
    onScrollEnd,
    autoScrolling,
  });

  if (!_columns.length) {
    return null;
  }

  const isScrollEnabled = Boolean(scroll && !virtual);
  const isScrollYDisabled =
    typeof scroll === "object" && scroll.y === false && !virtual;

  return (
    <Drag rowKey={props.rowKey} dataSource={dataSource} onDragEnd={onDragEnd}>
      <div
        className={classNames(styles.Table, className, cls)}
        ref={ref}
        id={id}
        style={
          {
            "--th-padding": thPadding,
            "--td-padding": tdPadding,
            "--expanded-cell-padding": expandedCellPadding || tdPadding,
          } as CSSProperties
        }
      >
        <div
          className={classNames(styles.antdTable, tableClassName, {
            [styles.scroll]: isScrollEnabled,
            [styles["y-unScroll"]]: isScrollYDisabled,
            [styles.hideScrollbar]: hideScrollbar,
            [styles.hideEmpty]: hideEmpty,
            [styles.isExpandedCellTable]: isExpandedCellTable,
          })}
        >
          <AntdTable
            {...TableConfig}
            bordered={bordered}
            components={onDragEnd ? { body: { row: Drag.Row } } : undefined}
            dataSource={paginatedDataSource}
            columns={renderedColumns}
            pagination={false}
            scroll={isScrollEnabled ? { y: "" } : undefined}
            expandable={
              expandable ? { ...expandable, columnWidth: 48 } : undefined
            }
            className={antdTableClassName}
            onChange={handleTableChange}
            virtual={virtual}
            rowSelection={
              rowSelection ? { ...rowSelection, columnWidth: 48 } : undefined
            }
          />
        </div>
        {pagination && (
          <Pagination
            pageSize={_pageSize}
            current={_pageNum}
            total={total || dataSource?.length}
            listLength={dataSource?.length}
            onChange={handlePageChange}
            size="small"
            showQuickJumper={true}
            onShowSizeChange={handlePageSizeChange}
            showSizeChanger={true}
            pageSizeOptions={[10, 20, 50, 100, 200]}
            showTotal={
              showTotal === false
                ? undefined
                : showTotal
                ? showTotal
                : (total) => `共 ${total} 条数据`
            }
            {...paginationConfig}
          />
        )}
      </div>
    </Drag>
  );
};

export default Table;
