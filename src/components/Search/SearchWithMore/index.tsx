import React from "react";
import { Form as AntdForm } from "antd";
import FormItem, { FormItemProps } from "../../FormItem";
import { CSSProperties } from "react";
import classNames from "classnames";
import styles from "../index.module.less";
import { useSearchCommon } from "../_hooks";
import { ChakraButtonProps } from "@/components/Button";
import { ButtonGroup } from "../_components/ButtonGroup";
import { SearchButtons } from "../_components/SearchButtons";
import { FilterDropdown } from "../_components/FilterDropdown";
import { ExpandButton } from "../_components/ExpandButton";
import { SearchPropsWithFilter } from "../_types";

export interface SearchWithMoreProps
  extends Omit<SearchPropsWithFilter, "moreSearchItems"> {
  moreSearchItems: FormItemProps[];
  beforeButtonGroup?: ChakraButtonProps[];
  affterButtonGroup?: ChakraButtonProps[];
}

/**
 * 带更多搜索项的 Search 组件
 * - 将搜索项分为基础项和更多项两组
 * - 初始只显示基础搜索项，点击展开后显示更多项
 * - 适合有大量搜索字段的场景
 */
const SearchWithMore: React.FC<SearchWithMoreProps> = (props) => {
  const {
    searchItems = [],
    moreSearchItems,
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
    onExpandChange,
    autoAdaptWidth = true,
    baseWidth,
    onValuesChange,
    searchDisabled = false,
    searchText,
    resetText,
    onFilterChange,
    columnOffsetWidth = 0,
  } = props;

  const [form] = AntdForm.useForm(externalForm);

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
    showAllSearchItems: true, // SearchWithMore 始终显示所有搜索项
    minLabelWidth,
    baseWidth,
    onSearch,
    onReset,
    columnOffsetWidth,
  });

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={classNames(styles.Search, className)}
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
                  showAllSearchItems={true}
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
    </div>
  );
};

export default SearchWithMore;
