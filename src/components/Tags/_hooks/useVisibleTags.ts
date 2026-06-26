import { useEffect, useState } from "react";
import { calculateVisibleCount } from "../_utils/calculateVisibleCount";

export interface UseVisibleTagsOptions {
  tags: string[];
  gap?: number;
  ellipsisTagWidth?: number;
  ellipsis?: boolean;
}

/**
 * 计算可见标签数量的 Hook
 * @param containerRef 容器引用
 * @param measureRef 测量容器引用
 * @param options 配置选项
 * @returns 可见的标签数量
 */
export function useVisibleTags(
  containerRef: React.RefObject<HTMLDivElement>,
  measureRef: React.RefObject<HTMLDivElement>,
  options: UseVisibleTagsOptions,
): number {
  const { tags, gap = 8, ellipsisTagWidth = 60, ellipsis = true } = options;
  const [visibleCount, setVisibleCount] = useState<number>(tags.length);

  // 当 tags 变化时，重置 visibleCount
  useEffect(() => {
    setVisibleCount(tags.length);
  }, [tags.length]);

  // 如果禁用省略，直接返回所有标签数量
  useEffect(() => {
    if (!ellipsis) {
      setVisibleCount(tags.length);
    }
  }, [ellipsis, tags.length]);

  // 计算可见的 tag 数量
  useEffect(() => {
    // 如果禁用省略，不进行计算
    if (!ellipsis) {
      return;
    }

    if (!containerRef.current || !measureRef.current || tags.length === 0) {
      setVisibleCount(tags.length);
      return;
    }

    const calculate = () => {
      const container = containerRef.current;
      const measureContainer = measureRef.current;
      if (!container || !measureContainer) return;

      const containerWidth = container.offsetWidth;
      if (containerWidth === 0) {
        // 容器宽度为 0，可能是隐藏状态，不进行计算
        return;
      }

      // 获取所有 tag 元素的实际宽度
      const tagElements = measureContainer.children;
      const tagWidths: number[] = [];
      for (let i = 0; i < tagElements.length; i++) {
        const element = tagElements[i] as HTMLElement;
        tagWidths.push(element.offsetWidth);
      }

      const count = calculateVisibleCount(
        containerWidth,
        tagWidths,
        gap,
        ellipsisTagWidth,
      );
      setVisibleCount(count);
    };

    // 使用 requestAnimationFrame 确保 DOM 已更新
    const timer = requestAnimationFrame(() => {
      calculate();
    });

    // 监听容器大小变化
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        calculate();
      });
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      cancelAnimationFrame(timer);
      resizeObserver.disconnect();
    };
  }, [tags, gap, ellipsisTagWidth, ellipsis, containerRef, measureRef]);

  return visibleCount;
}
