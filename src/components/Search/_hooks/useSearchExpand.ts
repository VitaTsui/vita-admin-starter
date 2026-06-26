import { useState, useEffect, useCallback } from "react";
import { FormItemProps } from "@/components/FormItem";

/**
 * 基于宽度自适应控制展开/收起的Hook
 * @param containerRef 容器引用
 * @param buttonGroupRef 按钮组引用
 * @param itemClassName 搜索项的className
 * @param itemCount 搜索项总数
 * @param columnNum 列数
 * @param autoAdaptWidth 是否启用自适应宽度
 * @param defaultExpanded 默认是否展开
 * @param onExpandChange 展开状态变化回调
 * @param searchItems 搜索项配置数组（可选）
 * @param showAllSearchItems 是否显示所有搜索项
 * @returns 展开状态及控制方法
 */
export function useSearchExpand(
  containerRef: React.RefObject<HTMLDivElement>,
  buttonGroupRef: React.RefObject<HTMLDivElement>,
  itemClassName: string,
  itemCount: number,
  columnNum: number,
  autoAdaptWidth: boolean,
  defaultExpanded: boolean,
  onExpandChange?: (expand: boolean) => void,
  searchItems?: FormItemProps[],
  showAllSearchItems?: boolean,
  columnOffsetWidth: number = 0
) {
  const [expand, setExpand] = useState<boolean>(defaultExpanded);
  const [visibleItemCount, setVisibleItemCount] = useState<number>(columnNum);

  useEffect(() => {
    if (!autoAdaptWidth || !containerRef.current || !!showAllSearchItems) {
      return;
    }

    const container = containerRef.current;

    const calculateVisibleItems = () => {
      if (!containerRef.current || !buttonGroupRef.current) return;

      const containerWidth = container.offsetWidth;
      // 减去padding
      const availableWidth = containerWidth - 30; // 15px padding on each side

      // 获取按钮组的实际宽度（计算所有子元素宽度总和）
      let buttonGroupWidth = 0;
      const buttonChildren = Array.from(buttonGroupRef.current.children);
      if (buttonChildren.length > 0) {
        // 计算所有子元素的宽度总和
        let totalWidth = 0;
        buttonChildren?.forEach((child) => {
          totalWidth += (child as HTMLElement).offsetWidth;
        });
        // 加上子元素之间的间距（column-gap: 10px）
        const childGap = 5;
        totalWidth += (buttonChildren.length - 1) * childGap;
        buttonGroupWidth = totalWidth;
      }

      // 获取所有搜索项元素
      const items = container.querySelectorAll(`${itemClassName}`);

      // 计算第一行能放下的搜索项数量
      let count = 0;
      let usedWidth = 0;
      const gap = 10; // 项之间的间距

      // 计算默认单个项的宽度（容器宽度除以列数）
      const defaultItemWidth =
        (availableWidth - (columnNum - 1) * gap) / columnNum -
        columnOffsetWidth;

      // 遍历所有搜索项（包括未渲染的）
      for (let i = 0; i < itemCount; i++) {
        let itemWidth = 0;

        // 如果DOM中有这个item，使用实际宽度
        if (i < items.length) {
          const item = items[i] as HTMLElement;
          itemWidth = item.offsetWidth;
        } else if (searchItems && searchItems[i]?.width !== undefined) {
          // 如果DOM中没有，但有设置宽度，使用设置的宽度
          const configWidth = searchItems[i].width;
          if (typeof configWidth === "number") {
            itemWidth = configWidth;
          } else if (typeof configWidth === "string") {
            // 处理百分比或像素值
            if (configWidth.endsWith("%")) {
              const percent = parseFloat(configWidth) / 100;
              itemWidth = availableWidth * percent;
            } else {
              itemWidth = parseFloat(configWidth);
            }
          }
        } else {
          // 如果DOM中没有且没有设置宽度，使用默认计算宽度
          itemWidth = defaultItemWidth;
        }

        // 计算加上当前项后的总宽度（包括gap）
        const nextWidth = usedWidth + itemWidth + (i > 0 ? gap : 0);

        // 检查是否还能放下按钮组（需要预留gap和按钮组宽度）
        if (nextWidth + gap + buttonGroupWidth <= availableWidth) {
          count++;
          usedWidth = nextWidth;
        } else {
          break;
        }
      }

      // 至少显示1个搜索项
      count = Math.max(1, count);
      setVisibleItemCount(count);

      // 如果所有项都能显示，则不需要展开
      if (count >= itemCount) {
        setExpand(false);
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      // 使用 requestAnimationFrame 延迟到下一帧，确保DOM已更新
      requestAnimationFrame(() => {
        calculateVisibleItems();
      });
    });

    // MutationObserver 监听DOM变化
    const mutationObserver = new MutationObserver(() => {
      // 使用 requestAnimationFrame 延迟到下一帧
      requestAnimationFrame(() => {
        calculateVisibleItems();
      });
    });

    resizeObserver.observe(container);
    mutationObserver.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style"],
    });

    // 监听窗口大小变化
    const handleWindowResize = () => {
      requestAnimationFrame(() => {
        calculateVisibleItems();
      });
    };
    window.addEventListener("resize", handleWindowResize);

    // 初始计算（延迟执行以确保DOM已渲染）
    requestAnimationFrame(() => {
      calculateVisibleItems();
    });

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("resize", handleWindowResize);
    };
  }, [
    containerRef,
    buttonGroupRef,
    itemClassName,
    itemCount,
    columnNum,
    autoAdaptWidth,
    searchItems,
    showAllSearchItems,
    columnOffsetWidth,
  ]);

  const toggleExpand = useCallback(() => {
    const newExpand = !expand;
    setExpand(newExpand);
    onExpandChange?.(newExpand);
  }, [expand, onExpandChange]);

  const handleSetExpand = useCallback(
    (newExpand: boolean) => {
      setExpand(newExpand);
      onExpandChange?.(newExpand);
    },
    [onExpandChange]
  );

  return {
    expand,
    setExpand: handleSetExpand,
    toggleExpand,
    visibleItemCount: autoAdaptWidth ? visibleItemCount : columnNum,
  };
}
