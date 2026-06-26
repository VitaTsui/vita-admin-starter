import { Form as AntdForm } from "antd";
import FormItem from "../FormItem";
import React, { CSSProperties } from "react";
import classNames from "classnames";
import styles from "./index.module.less";
import { useSearchCommon } from "./_hooks";
import SearchCard, { SearchCardProps } from "./SearchCard";
import SearchAdvanced from "./SearchAdvanced";
import SearchCollapsible from "./SearchCollapsible";
import SearchWithFilter from "./SearchWithFilter";
import SearchWithMore from "./SearchWithMore";
import { ButtonGroup } from "./_components/ButtonGroup";
import { SearchButtons } from "./_components/SearchButtons";
import { ExpandButton } from "./_components/ExpandButton";
import { BaseSearchProps } from "./_types";
import { ChakraButtonProps } from "@/components/Button";

export interface SearchProps extends BaseSearchProps {
  beforeButtonGroup?: ChakraButtonProps[];
  affterButtonGroup?: ChakraButtonProps[];
}

interface SearchFC extends React.FC<SearchProps> {
  Card: React.FC<SearchCardProps>;
  Advanced: typeof SearchAdvanced;
  Collapsible: typeof SearchCollapsible;
  WithFilter: typeof SearchWithFilter;
  WithMore: typeof SearchWithMore;
}

// 导出所有可用的 Search 模式键名
export type SearchModeKeys =
  | "Default"
  | keyof Omit<SearchFC, keyof React.FC<SearchProps>>;

// 导出 Search 模式映射类型
export type SearchModePropsMap = {
  Default: SearchProps;
  Card: React.ComponentProps<SearchFC["Card"]>;
  Advanced: React.ComponentProps<SearchFC["Advanced"]>;
  Collapsible: React.ComponentProps<SearchFC["Collapsible"]>;
  WithFilter: React.ComponentProps<SearchFC["WithFilter"]>;
  WithMore: React.ComponentProps<SearchFC["WithMore"]>;
};

const Search: SearchFC = (props) => {
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
    columnOffsetWidth = 0,
  } = props;

  const [form] = AntdForm.useForm(externalForm);

  const {
    containerRef,
    buttonGroupRef,
    cls,
    getLabelWidth,
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
            </ButtonGroup>
          )}
        </AntdForm>
      </div>
    </div>
  );
};

Search.Card = SearchCard;
Search.Advanced = SearchAdvanced;
Search.Collapsible = SearchCollapsible;
Search.WithFilter = SearchWithFilter;
Search.WithMore = SearchWithMore;

export default Search;
