import { FormInstance } from "antd";
import { useMemo, useRef, useCallback, RefObject } from "react";
import { FormItemProps } from "../../FormItem";
import { generateRandomStr } from "hsu-utils";
import useLabelWidth from "@/hooks/useLabelWidth";
import usePermissions from "@/hooks/usePermissions";
import { useSearchItems } from "./useSearchItems";
import { useSearchForm } from "./useSearchForm";
import { useAdaptiveColumnNum } from "./useAdaptiveColumnNum";
import { useSearchExpand } from "./useSearchExpand";
import {
  cleanSearchData,
  calculateVisibleItems,
  calculateButtonGroupAndColumnWidth,
} from "../_utils";
import styles from "../index.module.less";
import { ChakraButtonProps } from "@/components/Button";

export interface UseSearchCommonParams {
  form: FormInstance;
  searchItems: FormItemProps[];
  moreSearchItems?: FormItemProps[];
  searchData?: Record<string, unknown>;
  hasPermi?: string[];
  beforeButtonGroup?: ChakraButtonProps[];
  affterButtonGroup?: ChakraButtonProps[];
  columnNum: number;
  autoAdaptWidth: boolean;
  defaultExpanded: boolean;
  onExpandChange?: (expand: boolean) => void;
  showAllSearchItems: boolean;
  minLabelWidth?: boolean | number;
  baseWidth?: number;
  onSearch?: <T = Record<string, unknown>>(data?: Partial<T>) => void;
  onReset?: () => void;
  columnOffsetWidth?: number;
}

export interface UseSearchCommonReturn {
  // Refs
  containerRef: RefObject<HTMLDivElement>;
  buttonGroupRef: RefObject<HTMLDivElement>;
  cls: string;

  // Form
  getLabelWidth: ReturnType<typeof useLabelWidth>[1];

  // Search Items
  processedSearchItems: FormItemProps[];
  setSearchItems: (items: FormItemProps[]) => void;
  visibleSearchItems: FormItemProps[];
  visibleMoreSearchItems: FormItemProps[];
  visibleSearchItemCount: number;
  currentSearchItems: FormItemProps[];

  // Column & Layout
  totalColumnNum: number;
  adaptiveColumnNum: number;

  // Expand Control
  expand: boolean;
  setExpand?: (expand: boolean) => void;
  toggleExpand: () => void;
  visibleItemCount: number;
  hasCustomWidth: boolean;
  showExpandButton: boolean;

  // Callbacks
  onSearchClick: () => void;
  onResetClick: () => void;

  // Render Check
  shouldRender: boolean;
  // Permission
  permitted: boolean;
}

/**
 * 提取所有 Search 组件的通用逻辑
 */
export const useSearchCommon = (
  params: UseSearchCommonParams,
): UseSearchCommonReturn => {
  const {
    form,
    searchItems,
    moreSearchItems = [],
    searchData,
    hasPermi,
    beforeButtonGroup,
    affterButtonGroup,
    columnNum,
    autoAdaptWidth,
    defaultExpanded,
    onExpandChange,
    showAllSearchItems,
    baseWidth,
    onSearch,
    onReset,
    columnOffsetWidth = 0,
  } = params;

  const [, getLabelWidth] = useLabelWidth();
  const { permitted, checkPermission } = usePermissions(hasPermi);
  const { searchItems: processedSearchItems, setSearchItems } =
    useSearchItems(searchItems);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonGroupRef = useRef<HTMLDivElement>(null);
  const cls = useMemo(() => generateRandomStr(10), []);

  // 提取可见搜索项
  const visibleSearchItems = useMemo(() => {
    return processedSearchItems.filter((item) => item.visible !== false);
  }, [processedSearchItems]);

  // 提取可见的更多搜索项
  const visibleMoreSearchItems = useMemo(() => {
    return moreSearchItems.filter((item) => item.visible !== false);
  }, [moreSearchItems]);

  // 计算可见的搜索项数量
  const visibleSearchItemCount = useMemo(() => {
    return visibleSearchItems.length;
  }, [visibleSearchItems]);

  // 计算总列数（包括按钮组）
  const baseTotalColumnNum = useMemo(() => columnNum + 1, [columnNum]);

  // 根据容器宽度动态调整列数
  const totalColumnNum = useAdaptiveColumnNum(
    containerRef,
    baseTotalColumnNum,
    autoAdaptWidth,
    1, // minColumnNum
    undefined, // maxColumnNum
    undefined, // breakpoints
    baseWidth,
  );

  // 计算调整后的搜索项列数（不包括按钮组）
  const adaptiveColumnNum = useMemo(
    () => Math.max(1, totalColumnNum - 1),
    [totalColumnNum],
  );

  // 使用基于宽度的展开/收起控制
  const { expand, setExpand, toggleExpand, visibleItemCount } = useSearchExpand(
    containerRef,
    buttonGroupRef,
    `.${cls} .${styles.item}`,
    visibleSearchItemCount,
    adaptiveColumnNum,
    autoAdaptWidth,
    defaultExpanded,
    onExpandChange,
    processedSearchItems,
    showAllSearchItems || !!moreSearchItems?.length,
    columnOffsetWidth,
  );

  useSearchForm({ form, searchData });

  // 计算当前应该显示的搜索项
  const currentSearchItems = useMemo(() => {
    if (showAllSearchItems || !!moreSearchItems?.length) {
      if (expand) return [...visibleSearchItems, ...visibleMoreSearchItems];
      return visibleSearchItems;
    }

    // 计算按钮组宽度和列宽（用于判断是否需要显示更多项）
    let buttonGroupWidth: number | undefined;
    let columnWidth: number | undefined;

    if (!expand) {
      const result = calculateButtonGroupAndColumnWidth(
        containerRef,
        buttonGroupRef,
        adaptiveColumnNum,
        columnOffsetWidth,
      );
      buttonGroupWidth = result.buttonGroupWidth;
      columnWidth = result.columnWidth;
    }

    // 否则使用计算函数
    return calculateVisibleItems(
      processedSearchItems,
      expand,
      adaptiveColumnNum,
      visibleItemCount,
      autoAdaptWidth,
      buttonGroupWidth,
      columnWidth,
    );
  }, [
    showAllSearchItems,
    moreSearchItems?.length,
    expand,
    processedSearchItems,
    adaptiveColumnNum,
    visibleItemCount,
    autoAdaptWidth,
    visibleSearchItems,
    visibleMoreSearchItems,
    columnOffsetWidth,
  ]);

  const onResetClick = useCallback(() => {
    if (!form) return;
    form.resetFields();
    onReset?.();
  }, [form, onReset]);

  const onSearchClick = useCallback(() => {
    if (!form) return;
    form.validateFields().then((value) => {
      const cleanedData = cleanSearchData(value);
      onSearch?.(cleanedData);
    });
  }, [form, onSearch]);

  // 检查是否有自定义宽度
  const hasCustomWidth = useMemo(() => {
    return processedSearchItems.some((item) => item.width !== undefined);
  }, [processedSearchItems]);

  // 计算实际应该显示的项数（考虑按钮组宽度大于列宽的情况）
  const actualDisplayCount = useMemo(() => {
    if (hasCustomWidth) {
      return visibleItemCount;
    }

    // 计算按钮组宽度和列宽
    const { buttonGroupWidth, columnWidth } =
      calculateButtonGroupAndColumnWidth(
        containerRef,
        buttonGroupRef,
        adaptiveColumnNum,
        columnOffsetWidth,
      );

    // 判断按钮组宽度是否大于列宽，如果是，则显示 实际搜索项数量+1
    if (
      buttonGroupWidth !== undefined &&
      columnWidth !== undefined &&
      (buttonGroupWidth > columnWidth ||
        (buttonGroupWidth < columnWidth &&
          adaptiveColumnNum + 1 === visibleSearchItemCount))
    ) {
      return adaptiveColumnNum + 1;
    }

    return adaptiveColumnNum;
  }, [
    hasCustomWidth,
    adaptiveColumnNum,
    columnOffsetWidth,
    visibleSearchItemCount,
    visibleItemCount,
  ]);

  // 计算是否显示展开按钮
  const showExpandButton = useMemo(() => {
    // 如果有更多搜索项，显示展开按钮
    if (showAllSearchItems || !!moreSearchItems?.length) {
      if (visibleMoreSearchItems?.length) {
        return true;
      }
      return false;
    }

    // 如果有自定义宽度，根据可见项数量判断
    if (hasCustomWidth) {
      return visibleSearchItemCount > visibleItemCount;
    }
    // 否则根据实际显示项数判断（考虑按钮组宽度大于列宽的情况）
    return visibleSearchItemCount > actualDisplayCount;
  }, [
    showAllSearchItems,
    moreSearchItems,
    hasCustomWidth,
    visibleSearchItemCount,
    actualDisplayCount,
    visibleMoreSearchItems?.length,
    visibleItemCount,
  ]);

  // 检查按钮组是否有权限的按钮
  const hasPermittedButtons = useCallback(
    (buttonGroup?: ChakraButtonProps[]) => {
      if (!buttonGroup?.length) return false;

      return buttonGroup.some((button) => checkPermission(button.hasPermi));
    },
    [checkPermission],
  );

  // 权限和内容检查
  const shouldRender = useMemo(() => {
    return Boolean(
      hasPermittedButtons(beforeButtonGroup) ||
      hasPermittedButtons(affterButtonGroup) ||
      (permitted && searchItems.length > 0),
    );
  }, [
    searchItems.length,
    beforeButtonGroup,
    affterButtonGroup,
    permitted,
    hasPermittedButtons,
  ]);

  return {
    containerRef,
    buttonGroupRef,
    cls,
    getLabelWidth,
    processedSearchItems,
    setSearchItems,
    visibleSearchItems,
    visibleMoreSearchItems,
    visibleSearchItemCount,
    currentSearchItems,
    totalColumnNum,
    adaptiveColumnNum,
    expand,
    setExpand,
    toggleExpand,
    visibleItemCount,
    hasCustomWidth,
    showExpandButton,
    onSearchClick,
    onResetClick,
    shouldRender,
    permitted,
  };
};
