import React, { useMemo, useCallback, memo } from "react";
import { array_is_includes, Equal } from "hsu-utils";
import classNames from "classnames";
import { ElementItem, SearchCardOption } from "..";
import { updateRealValue } from "../../../_utils";
import styles from "../../../index.module.less";

interface ChildrenItemsProps {
  parentItem: ElementItem;
  option: SearchCardOption;
  value: Record<string, unknown>;
  setValue: (data: Record<string, unknown>) => void;
}

export const ChildrenItems: React.FC<ChildrenItemsProps> = memo((props) => {
  const { parentItem, option, value, setValue } = props;

  // 子项的名称，默认使用父项的name加上Children后缀
  const childrenName = useMemo(
    () => `${parentItem.name || option.name}Children`,
    [parentItem.name, option.name]
  );

  // 判断子项是否支持多选
  const isChildrenMultiple = !!parentItem.childrenMultiple;

  // 优化：缓存子项点击处理函数
  const createChildClickHandler = useCallback(
    (childItem: ElementItem) => {
      return () => {
        if (isChildrenMultiple) {
          // 多选模式：可以同时选择多个子项
          const currentValue = (value[childrenName] as unknown[]) || [];
          const newValues = array_is_includes(currentValue, [childItem.value])
            ? currentValue.filter((v) => !Equal.ValEqual(v, childItem.value))
            : [...currentValue, childItem.value];

          const newValue = {
            ...value,
            [childrenName]: newValues,
          };

          // 更新真实返回值
          updateRealValue(value, option.name, newValue);
          setValue(newValue);
        } else {
          // 单选模式：一次只能选一个子项
          const newValue = {
            ...value,
            [childrenName]: Equal.ValEqual(childItem.value, value[childrenName])
              ? ""
              : childItem.value,
          };

          // 更新真实返回值
          updateRealValue(value, option.name, newValue);
          setValue(newValue);
        }
      };
    },
    [isChildrenMultiple, value, childrenName, option.name, setValue]
  );

  if (!parentItem.children || parentItem.children.length === 0) {
    return null;
  }

  return (
    <div className={styles.childrenItems}>
      {parentItem.children?.map((childItem) => {
        // 判断子项是否被选中
        const isChildSelected = isChildrenMultiple
          ? array_is_includes((value[childrenName] as unknown[]) || [], [
              childItem.value,
            ])
          : value?.[childrenName] === childItem.value;

        return (
          <span
            key={String(childItem.value)}
            className={classNames({
              [styles.active]: isChildSelected,
            })}
            onClick={createChildClickHandler(childItem)}
          >
            {childItem.label}
          </span>
        );
      })}
    </div>
  );
});

ChildrenItems.displayName = "ChildrenItems";
