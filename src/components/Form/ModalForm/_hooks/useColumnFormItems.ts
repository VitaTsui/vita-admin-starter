import { useCallback } from "react";
import { FormItemProps } from "@/components/FormItem";

/**
 * 计算列布局中的表单项
 * @param columnNum 列数
 * @returns 计算列表单项的函数
 */
export const useColumnFormItems = (columnNum: number) => {
  /**
   * 获取指定索引之前所有全宽表单项（width === "100%"）的索引
   * @param formItems 所有表单项
   * @param endIndex 结束索引（包含）
   * @returns 全宽表单项的索引数组
   */
  const getFullWidthIndices = useCallback(
    (formItems: FormItemProps[], endIndex: number): number[] => {
      const fullWidthIndices: number[] = [];
      for (let i = 0; i <= endIndex; i++) {
        if (formItems[i]?.width === "100%") {
          fullWidthIndices.push(i);
        }
      }
      return fullWidthIndices;
    },
    []
  );

  /**
   * 计算表单项在列布局中的实际列位置索引
   * 考虑全宽项（width === "100%"）会占据整行，影响后续项的列位置
   * @param formItems 所有表单项
   * @param itemIndex 表单项的原始索引
   * @returns 实际列位置索引
   */
  const calculateActualColumnIndex = useCallback(
    (formItems: FormItemProps[], itemIndex: number): number => {
      const fullWidthIndices = getFullWidthIndices(formItems, itemIndex);

      // 计算由于全宽项导致的列偏移量
      // 使用 reduce 累积偏移量
      const offset = fullWidthIndices.reduce(
        (acc, curr, idx) =>
          acc +
          (columnNum - ((curr + acc + idx * (columnNum - 1)) % columnNum)),
        0
      );

      // 全宽项后的补充项数量
      const supplementItemsCount = fullWidthIndices.filter(
        (idx) => idx !== itemIndex
      ).length;
      const additionalOffset = supplementItemsCount * (columnNum - 1);

      // 返回实际列索引
      return (itemIndex + offset + additionalOffset) % columnNum;
    },
    [columnNum, getFullWidthIndices]
  );

  const columnFormItems = useCallback(
    (formItems: FormItemProps[], idx: number) => {
      // 计算目标索引的实际列索引
      const targetColumnIndex = calculateActualColumnIndex(formItems, idx);

      // 筛选出与目标项在同一列的所有表单项
      const sameColumnItems = formItems.filter((_, itemIndex) => {
        const itemColumnIndex = calculateActualColumnIndex(
          formItems,
          itemIndex
        );
        return itemColumnIndex === targetColumnIndex;
      });

      return sameColumnItems;
    },
    [calculateActualColumnIndex]
  );

  return columnFormItems;
};
