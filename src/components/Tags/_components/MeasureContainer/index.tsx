import { Tag } from "antd";
import React from "react";
import { getTagColor } from "../../_utils";
import styles from "./index.module.less";

export interface MeasureContainerProps {
  tags: string[];
  colors?: string[];
}

/**
 * 用于测量标签宽度的隐藏容器
 */
const MeasureContainer = React.forwardRef<
  HTMLDivElement,
  MeasureContainerProps
>((props, ref) => {
  const { tags, colors } = props;

  return (
    <div ref={ref} className={styles.measureContainer}>
      {tags?.map((tag, index) => (
        <Tag
          key={`measure-${tag}-${index}`}
          color={getTagColor(index, colors)}
          className={styles.tag}
        >
          {tag}
        </Tag>
      ))}
    </div>
  );
});

MeasureContainer.displayName = "MeasureContainer";

export default MeasureContainer;
