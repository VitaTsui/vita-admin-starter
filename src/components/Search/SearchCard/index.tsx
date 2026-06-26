import React, { CSSProperties, useRef, memo } from "react";
import classNames from "classnames";
import styles from "./index.module.less";
import OptionRow, {
  ElementItem,
  SearchCardOption,
  Font,
} from "./_components/OptionRow";
import { useSearchCardValue, useSearchCardCollapse } from "./_hooks";
import { SearchBox } from "./_components/SearchBox";
import { CollapseToggle } from "./_components/CollapseToggle";
import { isLegacyHasSelectorBrowser } from "@/utils/cssSupports";

export type { ElementItem, SearchCardOption, Font };

export interface SearchCardProps {
  options: SearchCardOption[];
  defaultValue?: Record<string, unknown>;
  onChange?: (data: Record<string, unknown>) => void;
  padding?: number;
  gap?: number;
  font?: Font;
  className?: string;
  defaultCollapse?: boolean;
  collapseExpand?: boolean;
  showSearchBox?: boolean;
  searchPlaceholder?: string;
  searchField?: string;
}

const SearchCard: React.FC<SearchCardProps> = memo((props) => {
  const {
    options,
    defaultValue,
    onChange,
    padding = 8,
    gap = 8,
    font = {
      family: "PingFangSC-Regular, PingFang SC",
      size: 14,
      weight: "400",
    },
    className,
    defaultCollapse = false,
    collapseExpand = true,
    showSearchBox = false,
    searchPlaceholder,
    searchField = "",
  } = props;
  const ref = useRef<HTMLDivElement>(null);
  const legacyHasSelector = isLegacyHasSelectorBrowser();

  const { value, setValue, internalValue, setInternalValue, getRealValues } =
    useSearchCardValue({
      defaultValue,
      searchField,
      options,
      onChange,
    });

  const { collapse, toggleCollapse } = useSearchCardCollapse({
    defaultCollapse,
  });

  // 处理搜索
  const handleSearch = () => {
    const realValues = getRealValues();
    onChange?.({ ...realValues, [searchField]: internalValue });
  };

  return (
    <div
      className={classNames(styles.SearchCard, className, {
        [styles.collapse]: collapse,
        [styles.legacyHasSearchBox]: legacyHasSelector && showSearchBox,
      })}
      style={
        {
          "--searchCard-column-gap": `${gap}px`,
          " --searchCard-padding-left-right": `${padding}px`,
        } as CSSProperties
      }
    >
      {showSearchBox && (
        <SearchBox
          value={internalValue}
          onChange={setInternalValue}
          onSearch={handleSearch}
          placeholder={searchPlaceholder}
        />
      )}

      <div className={styles.optionsBox} ref={ref}>
        <div className={styles.options}>
          {options?.map((option) => {
            return (
              <OptionRow
                key={option.name}
                option={option}
                value={value}
                setValue={(v) => {
                  setValue({
                    ...v,
                    [searchField]: internalValue,
                  });
                }}
                font={font}
                padding={padding}
                gap={gap}
                legacyHasSelector={legacyHasSelector}
              />
            );
          })}
        </div>
      </div>
      {collapseExpand && (
        <CollapseToggle collapse={collapse} onToggle={toggleCollapse} />
      )}
    </div>
  );
});

export default SearchCard;
