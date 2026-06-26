import { Tag } from "antd";
import React, { useRef } from "react";
import classNames from "classnames";
import { useVisibleTags } from "./_hooks";
import { getTagColor } from "./_utils";
import EllipsisTag from "./_components/EllipsisTag";
import MeasureContainer from "./_components/MeasureContainer";
import styles from "./index.module.less";

export interface TagsProps {
  className?: string;
  colors?: string[];
  tags: string[];
  ellipsis?: boolean;
  align?: "left" | "center" | "right";
  gap?: number;
}

const Tags: React.FC<TagsProps> = (props) => {
  const {
    className,
    colors,
    tags = [],
    ellipsis = true,
    align = "left",
    gap = 8,
  } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);

  // 使用 hook 计算可见的标签数量
  const visibleCount = useVisibleTags(containerRef, measureRef, {
    tags,
    ellipsis,
    gap,
  });

  // 获取可见的 tags 和省略的 tags
  const visibleTags = tags.slice(0, visibleCount);
  const ellipsisTags = tags.slice(visibleCount);

  return (
    <>
      {/* 用于测量 tag 宽度的隐藏容器（仅在启用省略时显示） */}
      {ellipsis && (
        <MeasureContainer ref={measureRef} tags={tags} colors={colors} />
      )}
      {/* 实际显示的容器 */}
      <div
        ref={ellipsis ? containerRef : undefined}
        className={classNames(styles.tagsContainer, className, {
          [styles.wrap]: !ellipsis,
          [styles.alignLeft]: align === "left",
          [styles.alignCenter]: align === "center",
          [styles.alignRight]: align === "right",
        })}
        style={{ "--gap": gap } as React.CSSProperties}
      >
        {visibleTags?.map((tag, index) => (
          <Tag
            key={`${tag}-${index}`}
            color={getTagColor(index, colors)}
            className={styles.tag}
          >
            {tag}
          </Tag>
        ))}
        {ellipsis && (
          <EllipsisTag
            ellipsisTags={ellipsisTags}
            startIndex={visibleCount}
            colors={colors}
          />
        )}
      </div>
    </>
  );
};

export default Tags;
