import { Tag, Tooltip } from "antd";
import React from "react";
import { getTagColor } from "../../_utils";
import styles from "./index.module.less";

export interface EllipsisTagProps {
  ellipsisTags: string[];
  startIndex: number;
  colors?: string[];
}

/**
 * 省略标签组件，显示被省略的标签数量，悬浮时通过 Tooltip 展示所有被省略的标签
 */
const EllipsisTag: React.FC<EllipsisTagProps> = (props) => {
  const { ellipsisTags, startIndex, colors } = props;

  if (ellipsisTags.length === 0) {
    return null;
  }

  return (
    <Tooltip
      title={
        <div className={styles.tooltipContent}>
          {ellipsisTags?.map((tag, index) => (
            <Tag
              key={`ellipsis-${tag}-${index}`}
              color={getTagColor(startIndex + index, colors)}
              className={styles.tooltipTag}
            >
              {tag}
            </Tag>
          ))}
        </div>
      }
      classNames={{
        root: styles.tooltip,
      }}
      color="#fff"
      styles={{
        body: {
          padding: "6px",
          maxHeight: "300px",
          overflow: "auto",
        },
      }}
    >
      <Tag className={styles.ellipsisTag}>+{ellipsisTags.length}</Tag>
    </Tooltip>
  );
};

export default EllipsisTag;
