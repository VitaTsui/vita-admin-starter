import React, { useState, useMemo, useCallback, memo } from "react";
import { array_is_includes, Equal } from "hsu-utils";
import classNames from "classnames";
import { Tooltip } from "antd";
import Icon from "@/components/Icon";
import { ElementItem, SearchCardOption } from "..";
import { updateRealValue } from "../../../_utils";
import styles from "../../../index.module.less";

interface ItemProps {
  item: ElementItem;
  idx: number;
  option: SearchCardOption;
  value: Record<string, unknown>;
  setValue: (data: Record<string, unknown>) => void;
}

export const Item: React.FC<ItemProps> = memo((props) => {
  const { item, idx, option, value, setValue } = props;
  const [lastElementValue, setLastElementValue] = useState<unknown>(undefined);

  // 优化：缓存激活状态计算
  const isActive = useMemo(() => {
    return option.multiple
      ? array_is_includes((value[option.name] as unknown[]) || [], [item.value])
      : value?.[option.name] === item.value;
  }, [option.multiple, option.name, value, item.value]);

  // 优化：缓存点击处理函数
  const handleClick = useCallback(() => {
    try {
      if (option.multiple) {
        const currentValue = (value[option.name] as unknown[]) || [];
        // 检查是否之前已选中
        const wasSelected = array_is_includes(currentValue, [item.value]);
        const newValues = wasSelected
          ? currentValue.filter((v) => !Equal.ValEqual(v, item.value))
          : [...currentValue, item.value];

        // 准备新的值对象
        const newValue: Record<string, unknown> = {
          ...value,
          [option.name]: newValues,
        };

        // 如果取消选中且有子项，清除子项的选择
        const hasChildren = item.children && item.children.length > 0;
        if (wasSelected && hasChildren) {
          const childrenName = `${item.name || option.name}Children`;
          newValue[childrenName] = item.childrenMultiple ? [] : "";
        }

        // 更新真实返回值
        updateRealValue(value, option.name, newValue);

        setValue(newValue);
      } else {
        // 检查是否之前已选中
        const wasSelected = Equal.ValEqual(item.value, value[option.name]);

        // 准备新的值对象
        const newValue: Record<string, unknown> = {
          ...value,
          [option.name]: wasSelected ? "" : item.value,
        };

        // 清除所有子项的选择状态
        if (!wasSelected) {
          // 清除所有子项选择状态
          option.items?.forEach((parentItem) => {
            if (parentItem.children && parentItem.children.length > 0) {
              const parentChildrenName = `${
                parentItem.name || option.name
              }Children`;
              newValue[parentChildrenName] = parentItem.childrenMultiple
                ? []
                : "";
            }
          });
        }

        // 更新真实返回值
        updateRealValue(value, option.name, newValue);

        setValue(newValue);
      }
    } catch {
      void 0;
    }
  }, [item, option, value, setValue]);

  if (item?.element) {
    const { label, name } = item;
    let { element } = item;

    element = {
      ...element,
      props: {
        ...element.props,
        value: option.multiple
          ? array_is_includes((value[name ?? option.name] as unknown[]) || [], [
              lastElementValue,
            ])
            ? lastElementValue
            : undefined
          : Equal.ValEqual(lastElementValue, value[name ?? option.name])
          ? value[name ?? option.name]
          : undefined,
        onChange: (e: React.ChangeEvent) => {
          if (option.multiple) {
            const currentValue = (
              (value[name ?? option.name] as unknown[]) || []
            ).filter((v) => !Equal.ValEqual(v, lastElementValue));

            const newValue = {
              ...value,
              [name ?? option.name]: e ? [...currentValue, e] : currentValue,
            };

            // 更新真实返回值
            updateRealValue(value, option.name, newValue);

            setValue(newValue);
            setLastElementValue(e);
          } else {
            const newValue = {
              ...value,
              [name ?? option.name]: e ?? "",
            };

            // 更新真实返回值
            updateRealValue(value, option.name, newValue);

            setValue(newValue);
            setLastElementValue(e);
          }
        },
      },
    };

    return (
      <div key={idx} className={classNames(styles.item, styles.elementItem)}>
        {!!label && <span className={styles.label}>{label}：</span>}
        {element}
        {item.help && (
          <Tooltip title={item.help}>
            <Icon
              icon="material-symbols:help-outline"
              className={styles.help}
            />
          </Tooltip>
        )}
      </div>
    );
  }

  if (!item?.element) {
    return (
      <span
        key={String(item.value)}
        className={classNames({
          [styles.active]: isActive,
        })}
        onClick={handleClick}
      >
        {item.label}
        {item.help && (
          <Tooltip title={item.help}>
            <Icon
              icon="material-symbols:help-outline"
              className={styles.help}
            />
          </Tooltip>
        )}
      </span>
    );
  }

  return null;
});

Item.displayName = "Item";
