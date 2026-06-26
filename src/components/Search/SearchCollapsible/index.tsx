import React from "react";
import { Form as AntdForm } from "antd";
import FormItem from "../../FormItem";
import { CSSProperties, useCallback, useState } from "react";
import classNames from "classnames";
import styles from "../index.module.less";
import { useSearchCommon } from "../_hooks";
import { ChakraButtonProps } from "@/components/Button";
import { ButtonGroup } from "../_components/ButtonGroup";
import { SearchButtons } from "../_components/SearchButtons";
import { FilterDropdown } from "../_components/FilterDropdown";
import { ExpandButton } from "../_components/ExpandButton";
import { CollapseToggle } from "../_components/CollapseToggle";
import { SearchPropsWithFilter } from "../_types";

export interface SearchCollapsibleProps extends SearchPropsWithFilter {
  onCollapseToggle?: (collapse: boolean) => void;
  beforeButtonGroup?: ChakraButtonProps[];
  affterButtonGroup?: ChakraButtonProps[];
}

/**
 * 可折叠模式的 Search 组件
 * - 可以完全折叠/展开整个搜索区域
 * - 通过 defaultExpanded 控制初始展开状态
 * - 适合需要隐藏搜索栏以获得更多展示空间的场景
 */
const SearchCollapsible: React.FC<SearchCollapsibleProps> = (props) => {
  const {
    searchItems = [],
    moreSearchItems = [],
    className,
    onSearch,
    onReset,
    externalForm,
    hasPermi,
    columnNum = 4,
    beforeButtonGroup,
    affterButtonGroup,
    searchData,
    setFilter,
    minLabelWidth,
    defaultExpanded = false,
    onCollapseToggle,
    onExpandChange,
    autoAdaptWidth = true,
    baseWidth,
    onValuesChange,
    searchDisabled = false,
    showAllSearchItems = false,
    searchText,
    resetText,
    onFilterChange,
    columnOffsetWidth = 0,
  } = props;

  const [form] = AntdForm.useForm(externalForm);
  // collapse 的语义是反的，所以需要取反 defaultExpanded
  const [collapse, setCollapse] = useState(!defaultExpanded);

  const {
    containerRef,
    buttonGroupRef,
    cls,
    getLabelWidth,
    processedSearchItems,
    setSearchItems,
    currentSearchItems,
    totalColumnNum,
    expand,
    toggleExpand,
    showExpandButton,
    onSearchClick,
    onResetClick,
    shouldRender,
    permitted,
  } = useSearchCommon({
    form,
    searchItems,
    moreSearchItems,
    searchData,
    hasPermi,
    beforeButtonGroup,
    affterButtonGroup,
    columnNum,
    autoAdaptWidth,
    defaultExpanded,
    onExpandChange,
    showAllSearchItems,
    minLabelWidth,
    baseWidth,
    onSearch,
    onReset,
    columnOffsetWidth,
  });

  // 处理折叠切换
  const handleCollapseToggle = useCallback(() => {
    setCollapse((prev) => {
      const newCollapse = !prev;
      onCollapseToggle?.(newCollapse);
      return newCollapse;
    });
  }, [onCollapseToggle]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={classNames(styles.Search, className, {
        [styles.collapseExpand]: true,
        [styles.collapse]: collapse,
      })}
      style={
        {
          "--column-number": totalColumnNum,
          "--column-offset-width": `${columnOffsetWidth}px`,
        } as CSSProperties
      }
    >
      <div
        className={classNames(styles.searchOption, styles[expand.toString()])}
      >
        <AntdForm
          form={form}
          className={classNames(styles.option, cls)}
          onValuesChange={onValuesChange}
        >
          {permitted &&
            currentSearchItems?.map((item, idx) => {
              // 计算同一列的项（用于计算标签宽度）
              const visibleCurrentItems = currentSearchItems.filter(
                (i) => i.visible !== false
              );
              const columnIndex = idx % totalColumnNum;
              const sameColumnItems = visibleCurrentItems.filter(
                (_, _idx) => _idx % totalColumnNum === columnIndex
              );

              return (
                <FormItem
                  {...item}
                  key={item.name}
                  className={classNames(styles.item, item.className, {
                    [styles.unFill]: item.width !== undefined,
                  })}
                  labelWidth={
                    item.width !== undefined
                      ? undefined
                      : getLabelWidth(sameColumnItems, undefined, minLabelWidth)
                  }
                />
              );
            })}
          {(beforeButtonGroup?.length ||
            affterButtonGroup?.length ||
            permitted) && (
            <ButtonGroup
              beforeButtonGroup={beforeButtonGroup}
              affterButtonGroup={affterButtonGroup}
              expandButton={
                <ExpandButton
                  expand={expand}
                  toggleExpand={toggleExpand}
                  advancedFilters={false}
                  showExpandButton={showExpandButton}
                  showAllSearchItems={
                    showAllSearchItems || !!moreSearchItems?.length
                  }
                />
              }
              permitted={permitted}
              ref={buttonGroupRef}
            >
              {currentSearchItems.length > 0 && (
                <SearchButtons
                  onSearch={onSearchClick}
                  onReset={onResetClick}
                  searchDisabled={searchDisabled}
                  searchText={searchText}
                  resetText={resetText}
                />
              )}
              {setFilter && (
                <FilterDropdown
                  searchItems={processedSearchItems}
                  originalSearchItems={searchItems}
                  setSearchItems={setSearchItems}
                  onFilterChange={onFilterChange}
                />
              )}
            </ButtonGroup>
          )}
        </AntdForm>
      </div>
      {permitted && (
        <CollapseToggle collapse={collapse} onToggle={handleCollapseToggle} />
      )}
    </div>
  );
};

export default SearchCollapsible;
