import { RefObject, useEffect, useState } from "react";

/**
 * 根据容器宽度动态调整列数
 * @param containerRef 需要监听宽度的容器
 * @param columnNum 基础列数
 * @param enabled 是否开启自适应
 * @param minColumnNum 最小列数
 * @param maxColumnNum 最大列数
 * @param baseWidth 参考宽度（根据设计稿可调整）
 */
export const useAdaptiveColumnNum = (
  containerRef: RefObject<HTMLElement> | HTMLElement | null,
  columnNum: number,
  enabled: boolean = true,
  minColumnNum: number = 1,
  maxColumnNum?: number,
  baseWidth: number = 1200,
  active: boolean = true
) => {
  const [adaptiveColumnNum, setAdaptiveColumnNum] = useState<number>(columnNum);

  useEffect(() => {
    if (!enabled || !active) {
      setAdaptiveColumnNum(columnNum);
      return;
    }

    const container =
      containerRef && "current" in containerRef
        ? containerRef.current
        : (containerRef as HTMLElement | null);

    if (!container) {
      return;
    }

    const calculateColumnNum = () => {
      if (!container) return;

      const containerWidth = container.parentElement!.offsetWidth;

      // 以 baseWidth 为基准，根据当前容器宽度等比例缩放
      let next = Math.round((columnNum * containerWidth) / baseWidth);

      if (next < minColumnNum) next = minColumnNum;
      if (maxColumnNum !== undefined && next > maxColumnNum) {
        next = maxColumnNum;
      }

      setAdaptiveColumnNum(next);
    };

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(calculateColumnNum);
    });

    resizeObserver.observe(container);
    window.addEventListener("resize", calculateColumnNum);

    requestAnimationFrame(calculateColumnNum);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", calculateColumnNum);
    };
  }, [
    containerRef,
    columnNum,
    enabled,
    minColumnNum,
    maxColumnNum,
    baseWidth,
    active,
  ]);

  return enabled ? adaptiveColumnNum : columnNum;
};
