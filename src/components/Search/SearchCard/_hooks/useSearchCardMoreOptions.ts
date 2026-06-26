import { Equal, get_string_size } from "hsu-utils";
import { useEffect, useState, RefObject, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { ElementItem, Font, SearchCardOption } from "../_components/OptionRow";

// 优化：缓存测量结果
const measurementCache = new Map<string, number>();

function directMeasureWidth(element: React.ReactElement): Promise<number> {
  // 尝试从缓存获取
  const cacheKey = JSON.stringify(element.props);
  if (measurementCache.has(cacheKey)) {
    return Promise.resolve(measurementCache.get(cacheKey)!);
  }

  return new Promise((resolve) => {
    // 创建隐藏容器
    const container = document.createElement("div");

    // 设置样式使其不可见但能正确计算尺寸
    Object.assign(container.style, {
      position: "absolute",
      visibility: "hidden",
      display: "block",
      height: "auto",
      width: "auto",
      top: "-9999px",
      left: "-9999px",
    });

    document.body.appendChild(container);

    // 创建根并渲染
    const root = createRoot(container);

    try {
      // 直接渲染元素
      root.render(element);

      // 等待渲染完成
      setTimeout(() => {
        try {
          // 获取容器中第一个子元素的宽度
          const width = container.clientWidth || 0;

          // 缓存结果
          measurementCache.set(cacheKey, width);
          resolve(width);
        } catch {
          resolve(0);
        }

        // 清理
        try {
          root.unmount();
          if (document.body.contains(container)) {
            document.body.removeChild(container);
          }
        } catch {
          void 0;
        }
      }, 10);
    } catch {
      resolve(0);

      // 清理
      try {
        if (document.body.contains(container)) {
          document.body.removeChild(container);
        }
      } catch {
        void 0;
      }
    }
  });
}

/**
 * 自定义Hook，用于计算需要显示"更多"按钮的选项
 */
export function useSearchCardMoreOptions(
  containerRef: RefObject<HTMLDivElement>,
  options: SearchCardOption[],
  font: Font = {
    family: "PingFangSC-Regular, PingFang SC",
    size: 14,
    weight: "400",
  },
  padding: number = 8,
  gap: number = 8
) {
  const [showMore, setShowMore] = useState<Record<string, boolean>>({});

  // 优化：缓存计算函数
  const calculateMoreOptions = useCallback(async () => {
    if (containerRef.current) {
      const div = containerRef.current;
      const width = div.clientWidth;
      const moreWidth = get_string_size("更多", font).width + 15;
      const hasMore: Record<string, boolean> = {};

      for (const option of options) {
        const { width: labelWidth } = get_string_size(
          `${option.label}：`,
          font
        );

        const _options = (
          option.hideAll
            ? option.items
            : [{ label: "全部", value: "" }, ...option.items]
        ) as Array<ElementItem>;

        const optionsWidth: number[] = [];
        for (const item of _options) {
          if (item?.element) {
            const elementWidth = await directMeasureWidth(item.element);
            const labelWidth = get_string_size(item?.label ?? "", font).width;

            optionsWidth.push(elementWidth + labelWidth);
          } else {
            const labelWidth = get_string_size(item?.label ?? "", font).width;
            optionsWidth.push(+(labelWidth + padding * 2).toFixed(2));
          }
        }

        const idx = optionsWidth.reduce((prevIdx, curr, currIdx) => {
          const prev = optionsWidth
            .slice(0, currIdx)
            .reduce((a, b) => a + b, 0);

          if (
            Math.ceil(
              labelWidth + 4 + prev + curr + currIdx * gap + 4 + moreWidth
            ) >= width
          ) {
            if (
              Math.round(labelWidth + 4 + prev + curr + currIdx * gap) <=
                width &&
              currIdx === optionsWidth.length - 1
            ) {
              return currIdx;
            }

            return prevIdx;
          }

          return currIdx;
        }, 0);

        if (idx < optionsWidth.length - 1) {
          hasMore[option.name] = false;
        }
      }

      if (!Equal.ObjEqual(Object.keys(showMore), Object.keys(hasMore))) {
        setShowMore(hasMore);
      }
    }
  }, [containerRef, options, font, padding, gap, showMore]);

  useEffect(() => {
    calculateMoreOptions();

    // 添加窗口大小调整监听器
    window.addEventListener("resize", calculateMoreOptions);

    return () => {
      window.removeEventListener("resize", calculateMoreOptions);
    };
  }, [calculateMoreOptions]);

  return { showMore, setShowMore };
}

