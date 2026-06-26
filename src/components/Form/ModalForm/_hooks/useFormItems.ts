import { useMemo } from "react";
import { FormItemProps } from "@/components/FormItem";
import useLabelWidth from "@/hooks/useLabelWidth";
import { useColumnFormItems } from "./useColumnFormItems";

/**
 * 处理表单项的布局和标签宽度计算
 * @param formItems 表单项配置
 * @param layout 布局方式
 * @param columnNum 列数
 * @returns 处理后的表单项
 */
export const useFormItems = (
  formItems: FormItemProps[] | Record<string, FormItemProps[]>,
  layout?: "horizontal" | "vertical",
  columnNum: number = 2
) => {
  const [labelWidth, getLabelWidth] = useLabelWidth(
    Array.isArray(formItems) ? formItems : Object.values(formItems ?? {}).flat()
  );
  const columnFormItems = useColumnFormItems(columnNum);

  const _formItems = useMemo(() => {
    const _formItems: Record<string, FormItemProps[]> = Object.assign(
      {},
      Array.isArray(formItems) ? { "": formItems } : formItems
    );
    Object.keys(_formItems)?.forEach((key) => {
      _formItems[key]?.forEach((item, idx) => {
        if (layout === "horizontal") {
          item.labelWidth = getLabelWidth(
            columnFormItems(_formItems[key], idx)
          );
        } else {
          item.labelWidth = labelWidth;
        }
      });
    });
    return _formItems;
  }, [formItems, layout, getLabelWidth, columnFormItems, labelWidth]);

  return _formItems;
};
