import React from "react";
import { Form as AntdForm } from "antd";
import FormItem from "../../FormItem";
import { CSSProperties } from "react";
import classNames from "classnames";
import styles from "../index.module.less";
import { useSearchCommon } from "../_hooks";
import { ChakraButtonProps } from "@/components/Button";
import { DrawerFormProps } from "../../Form/DrawerForm";
import { ButtonGroup } from "../_components/ButtonGroup";
import { SearchButtons } from "../_components/SearchButtons";
import { FilterDropdown } from "../_components/FilterDropdown";
import { ExpandButton } from "../_components/ExpandButton";
import { AdvancedFiltersDrawer } from "../_components/AdvancedFiltersDrawer";
import { SearchPropsWithFilter } from "../_types";

export interface SearchAdvancedProps extends SearchPropsWithFilter {
  advancedFiltersProps?: DrawerFormProps;
  beforeButtonGroup?: ChakraButtonProps[];
  affterButtonGroup?: ChakraButtonProps[];
}

/**
 * 高级筛选模式的 Search 组件
 * - 不显示标签（label）
 * - 使用抽屉形式展示更多筛选项
 * - 更适合复杂的筛选场景
 */
const SearchAdvanced: React.FC<SearchAdvancedProps> = (props) => {
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
    advancedFiltersProps,
    setFilter,
    minLabelWidth,
    defaultExpanded = false,
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
    setExpand,
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

  if (!shouldRender) {
    return null;
  }

  return (
    <>
      <div
        ref={containerRef}
        className={classNames(styles.Search, className, {
          [styles.advancedFilters]: true,
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
              currentSearchItems?.map((item) => {
                return (
                  <FormItem
                    {...item}
                    key={item.name}
                    className={classNames(styles.item, item.className, {
                      [styles.unFill]: item.width !== undefined,
                    })}
                    label={undefined}
                    labelWidth={undefined}
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
                    advancedFilters={true}
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
      </div>
      {permitted && setExpand && (
        <AdvancedFiltersDrawer
          expand={expand}
          setExpand={setExpand}
          searchItems={processedSearchItems}
          form={form}
          getLabelWidth={getLabelWidth}
          minLabelWidth={minLabelWidth}
          onSearchClick={onSearchClick}
          onResetClick={onResetClick}
          advancedFiltersProps={advancedFiltersProps}
        />
      )}
    </>
  );
};

export default SearchAdvanced;
