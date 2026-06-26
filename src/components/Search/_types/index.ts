import { FormInstance } from "antd";
import { ReactNode } from "react";
import { FormItemProps } from "../../FormItem";
import { ChakraButtonProps } from "@/components/Button";

/**
 * Search 组件的基础属性接口
 */
export interface BaseSearchProps {
  searchItems?: FormItemProps[];
  moreSearchItems?: FormItemProps[];
  onSearch?: <T = Record<string, unknown>>(data?: Partial<T>) => void;
  onReset?: () => void;
  className?: string;
  externalForm?: FormInstance;
  hasPermi?: string[];
  /** 搜索项列数（不包括按钮组，总列数为 columnNum + 1） */
  columnNum?: number;
  beforeButtonGroup?: ChakraButtonProps[];
  affterButtonGroup?: ChakraButtonProps[];
  searchData?: Record<string, unknown>;
  minLabelWidth?: boolean | number;
  /** 默认是否展开 */
  defaultExpanded?: boolean;
  /** 展开状态变化时的回调 */
  onExpandChange?: (expand: boolean) => void;
  /** 是否启用基于宽度的自适应布局（默认显示一行包括按钮） */
  autoAdaptWidth?: boolean;
  /** 自适应布局的基准宽度（默认1200px） */
  baseWidth?: number;
  onValuesChange?: (
    value: Record<string, unknown>,
    values: Record<string, unknown>
  ) => void;
  searchDisabled?: boolean;
  showAllSearchItems?: boolean;
  /** 查询按钮文本 */
  searchText?: ReactNode;
  /** 重置按钮文本 */
  resetText?: ReactNode;
  /** 列偏移宽度，用于调整列宽计算（默认 0） */
  columnOffsetWidth?: number;
}

/**
 * 带筛选器的 Search 组件属性接口
 */
export interface SearchPropsWithFilter extends BaseSearchProps {
  /** 是否显示筛选器 */
  setFilter?: boolean;
  /** FilterDropdown 勾选项变化时的回调 */
  onFilterChange?: (items: FormItemProps[]) => void;
}
