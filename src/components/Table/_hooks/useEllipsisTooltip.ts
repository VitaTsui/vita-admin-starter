import { useCallback } from "react";
import { ColumnsType, EllipsisTooltipConfig } from "..";
import { AnyObject } from "antd/es/_util/type";
import TextEllipsis from "../../TextEllipsis";
import React from "react";

/**
 * 为设置了 ellipsis 且没有自定义 render 的列自动添加溢出检测和 Tooltip
 */
const useEllipsisTooltip = <T extends AnyObject>(
  tooltipConfig?: EllipsisTooltipConfig,
) => {
  const enhanceColumns = useCallback(
    (columns?: ColumnsType<T>): ColumnsType<T> | undefined => {
      return columns?.map((column) => {
        // 递归处理子列
        if (column.children) {
          return {
            ...column,
            children: enhanceColumns(column.children),
          };
        }

        // 如果设置了 ellipsis 且没有自定义 render
        if (column.ellipsis && !column.render && column.dataIndex) {
          return {
            ...column,
            render: (text) => {
              // 获取实际的显示值
              const displayValue =
                typeof text === "string" || typeof text === "number"
                  ? text
                  : String(text ?? "");

              return React.createElement(TextEllipsis, {
                width:
                  Math.max(Number(column.width ?? 0), 300) === 300
                    ? undefined
                    : Math.max(Number(column.width ?? 0), 300),
                tooltipConfig: tooltipConfig,
                children: displayValue,
                ellipsisPosition:
                  column.ellipsisPosition ?? tooltipConfig?.ellipsisPosition,
                key: text,
              });
            },
          };
        }

        return column;
      });
    },
    [tooltipConfig],
  );

  return { enhanceColumns };
};

export default useEllipsisTooltip;
