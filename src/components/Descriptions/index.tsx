import React, { CSSProperties, ReactNode, useMemo } from "react";
import {
  Descriptions as AntdDescriptions,
  DescriptionsProps as AntdDescriptionsProps,
} from "antd";
import { get_string_size } from "hsu-utils";
import usePermissions from "@/hooks/usePermissions";
import styles from "./index.module.less";

export interface ColumnsType {
  title: string;
  dataIndex: string;
  hidded?: boolean;
  sort?: number;
  hasPermi?: string[];
  render?: (value: unknown, record: Record<string, unknown>) => ReactNode;
}

interface DescriptionsProps extends AntdDescriptionsProps {
  columns?: ColumnsType[];
  dataSource?: Record<string, unknown>;
}

type ItemType = NonNullable<AntdDescriptionsProps["items"]>[number];

const Descriptions: React.FC<DescriptionsProps> = (props) => {
  const {
    columns,
    dataSource = {},
    items,
    classNames,
    layout = "horizontal",
    styles: _styles,
    colon = true,
    bordered,
    column = 4,
    ...escriptionsConfig
  } = props;
  const { checkPermission } = usePermissions();

  const _items = useMemo<ItemType[]>(() => {
    if (columns) {
      return columns
        ?.map((item) => ({
          ...item,
          hidded: !checkPermission(item.hasPermi) || item.hidded,
        }))
        .filter((item) => !item.hidded)
        .sort((a, b) => (a?.sort ?? 0) - (b?.sort ?? 0))
        ?.map((column) => ({
          key: column.dataIndex,
          label: column.title,
          children: column.render ? (
            column.render(dataSource?.[column.dataIndex], dataSource)
          ) : (
            <>
              {typeof dataSource?.[column.dataIndex] === "object"
                ? ""
                : dataSource?.[column.dataIndex]}
            </>
          ),
        }));
    }
    return (items || []) as ItemType[];
  }, [columns, dataSource, items, checkPermission]);

  const labelWidths = useMemo(() => {
    if (layout === "vertical" || bordered) return null;

    const getWidth = (label: ReactNode) => {
      const str = (label as string) + (colon ? "：" : "");
      const { width } = get_string_size(str, { size: 14 });

      return width;
    };

    if (typeof column === "number") {
      const widths = new Array(column).fill(0);
      let currentIdx = 0;

      _items?.forEach((item) => {
        const width = getWidth(item.label);
        const colIndex = currentIdx % column;

        if (width > widths[colIndex]) {
          widths[colIndex] = width;
        }

        currentIdx += (item.span as number) || 1;
      });

      return widths;
    } else {
      let max = 0;
      _items?.forEach((item) => {
        const width = getWidth(item.label);
        if (width > max) max = width;
      });

      return max;
    }
  }, [_items, colon, column, layout, bordered]);

  const finalItems = useMemo(() => {
    if (layout === "vertical" || bordered || !labelWidths) return _items;

    let currentIdx = 0;
    const colCount = typeof column === "number" ? column : 3;

    return _items?.map((item) => {
      let width;
      if (Array.isArray(labelWidths)) {
        width = labelWidths[currentIdx % colCount];
      } else {
        width = labelWidths;
      }

      const newItem: ItemType = {
        ...item,
        labelStyle: {
          ...item.labelStyle,
          width: `${width}px`,
          display: "inline-flex",
          justifyContent: "flex-end",
        },
      };

      currentIdx += (item.span as number) || 1;

      return newItem;
    });
  }, [_items, labelWidths, column, layout, bordered]);

  return (
    <AntdDescriptions
      items={finalItems}
      classNames={{
        root: `${styles.Descriptions} ${classNames?.root || ""}`,
        label: `${styles.label} ${
          layout === "horizontal" ? styles.horizontal : ""
        } ${classNames?.label || ""}`,
        content: `${styles.content} ${classNames?.content || ""}`,
        ...classNames,
      }}
      styles={{
        ..._styles,
        label: {
          ...(_styles?.label as CSSProperties),
        } as CSSProperties,
      }}
      colon={colon}
      layout={layout}
      bordered={bordered}
      column={column}
      {...escriptionsConfig}
    />
  );
};

export default Descriptions;
