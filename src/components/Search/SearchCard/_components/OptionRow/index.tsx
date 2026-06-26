import React, {
  useRef,
  useEffect,
  useState,
  useMemo,
  useCallback,
  memo,
} from "react";
import { array_is_includes } from "hsu-utils";
import classNames from "classnames";
import Icon from "@/components/Icon";
import { useSearchCardMoreOptions } from "../../_hooks";
import { Item } from "./Item";
import { ChildrenItems } from "./ChildrenItems";
import styles from "../../index.module.less";

export interface ElementItem {
  element?: React.ReactElement;
  label?: string;
  value?: string | number | boolean;
  name?: string;
  children?: ElementItem[];
  childrenMultiple?: boolean;
  help?: string;
}

export interface SearchCardOption {
  label?: string;
  name: string;
  items: ElementItem[];
  hideAll?: boolean;
  multiple?: boolean;
}

export interface Font {
  family?: string;
  size?: number;
  weight?: string;
}

interface OptionRowProps {
  option: SearchCardOption;
  value: Record<string, unknown>;
  setValue: (data: Record<string, unknown>) => void;
  font?: Font;
  padding?: number;
  gap?: number;
  legacyHasSelector?: boolean;
}

const OptionRow: React.FC<OptionRowProps> = memo((props) => {
  const {
    option,
    value,
    setValue,
    font = {
      family: "PingFangSC-Regular, PingFang SC",
      size: 14,
      weight: "400",
    },
    padding = 8,
    gap = 8,
    legacyHasSelector = false,
  } = props;

  const optionRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const [labelWidth, setLabelWidth] = useState(0);

  // 测量标签宽度
  useEffect(() => {
    if (labelRef.current) {
      const width = labelRef.current.offsetWidth;
      setLabelWidth(width);
    }
  }, [option.label]);

  const { showMore, setShowMore } = useSearchCardMoreOptions(
    optionRef,
    [option],
    font,
    padding,
    gap
  );

  // 优化：缓存过滤后的子项
  const filteredChildrenItems = useMemo(() => {
    return option.items.filter(
      (item) =>
        // 过滤条件：1. 有子项 2. 父项被选中
        item.children &&
        item.children.length > 0 &&
        (option.multiple
          ? array_is_includes((value[option.name] as unknown[]) || [], [
              item.value,
            ])
          : value?.[option.name] === item.value)
    );
  }, [option.items, option.multiple, option.name, value]);

  // 优化：缓存"全部"按钮点击处理函数
  const handleAllClick = useCallback(() => {
    const newValue = { ...value, [option.name]: "" };

    // 清除所有子项的选择
    option.items?.forEach((parentItem) => {
      if (parentItem.children && parentItem.children.length > 0) {
        const parentChildrenName = `${parentItem.name || option.name}Children`;
        newValue[parentChildrenName] = parentItem.childrenMultiple ? [] : "";
      }
    });

    // 设置Real值为空
    newValue[`${option.name}Real`] = "";

    setValue(newValue);
  }, [value, option, setValue]);

  // 优化：缓存"更多"按钮点击处理函数
  const handleMoreClick = useCallback(() => {
    const newShowMore = {
      ...showMore,
      [option.name]: !showMore[option.name],
    };
    setShowMore(newShowMore);
  }, [showMore, option.name, setShowMore]);

  // 优化：缓存"全部"按钮的激活状态
  const isAllActive = useMemo(() => {
    return option.multiple
      ? !((value[option.name] as unknown[]) || []).length
      : !value?.[option.name];
  }, [option.multiple, option.name, value]);

  const hasElementItem = useMemo(() => {
    return option.items?.some((item) => !!item.element);
  }, [option.items]);

  return (
    <div className={styles.optionContainer}>
      <div
        key={option.name}
        className={classNames(styles.option, {
          [styles.legacyHasElementItem]: legacyHasSelector && hasElementItem,
        })}
        ref={optionRef}
      >
        {!!option.label && <span ref={labelRef}>{option.label}：</span>}
        <div
          className={classNames(styles.optionItems, {
            [styles.itemsCollapse]: !showMore[option.name],
          })}
        >
          {!option.hideAll && (
            <span
              className={classNames({
                [styles.active]: isAllActive,
              })}
              onClick={handleAllClick}
            >
              全部
            </span>
          )}
          {option.items?.map((item, idx) => (
            <Item
              key={String(item.value)}
              item={item}
              idx={idx}
              option={option}
              value={value}
              setValue={setValue}
            />
          ))}
        </div>
        {typeof showMore[option.name] === "boolean" && (
          <span className={styles.more} onClick={handleMoreClick}>
            更多
            <Icon icon="icon-park-solid:down-one" />
          </span>
        )}
      </div>

      {/* 渲染所有有子项的父项的子项选项 */}
      {filteredChildrenItems?.map((item, idx) => (
        <div
          key={`${String(item.value)}-children-${idx}`}
          className={styles.childrenRow}
          style={{ marginLeft: labelWidth + 4 }}
        >
          <ChildrenItems
            parentItem={item}
            option={option}
            value={value}
            setValue={setValue}
          />
        </div>
      ))}
    </div>
  );
});

OptionRow.displayName = "OptionRow";

export default OptionRow;
