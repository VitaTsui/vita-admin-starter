import { useEffect, useState, RefObject } from "react";

/**
 * 根据容器宽度动态调整列数的Hook
 * @param containerRef 容器引用
 * @param totalColumnNum 基础总列数（包括按钮组）
 * @param enabled 是否启用自适应（默认true）
 * @param minColumnNum 最小列数（默认1）
 * @param maxColumnNum 最大列数（默认不限制）
 * @param breakpoints 断点配置，格式：{ width: columnNum }，例如 { 1200: 5, 800: 3 }
 * @param baseWidth 基准宽度，用于计算宽度比例（默认1200px）
 * @returns 调整后的总列数
 */
export function useAdaptiveColumnNum(
  containerRef: RefObject<HTMLDivElement>,
  totalColumnNum: number,
  enabled: boolean = true,
  minColumnNum: number = 1,
  maxColumnNum?: number,
  breakpoints?: Record<number, number>,
  baseWidth: number = 1200
) {
  const [adaptiveColumnNum, setAdaptiveColumnNum] =
    useState<number>(totalColumnNum);

  useEffect(() => {
    if (!enabled) {
      setAdaptiveColumnNum(totalColumnNum);
      return;
    }

    const calculateColumnNum = () => {
      if (!containerRef.current || !containerRef.current.offsetWidth) return;

      const containerWidth = containerRef.current.offsetWidth;

      let calculatedColumnNum = totalColumnNum;

      // 如果提供了断点配置，优先使用断点
      if (breakpoints) {
        const sortedBreakpoints = Object.keys(breakpoints)
          ?.map(Number)
          .sort((a, b) => b - a); // 从大到小排序

        for (const breakpoint of sortedBreakpoints) {
          if (containerWidth >= breakpoint) {
            calculatedColumnNum = breakpoints[breakpoint];
            break;
          }
        }
      } else {
        // 默认策略：根据容器宽度自动计算
        // 基于基础列数，根据容器宽度比例调整
        const widthRatio = containerWidth / baseWidth;
        calculatedColumnNum = Math.round(totalColumnNum * widthRatio);
      }

      // 应用最小值和最大值限制
      if (calculatedColumnNum < minColumnNum) {
        calculatedColumnNum = minColumnNum;
      }
      if (maxColumnNum !== undefined && calculatedColumnNum > maxColumnNum) {
        calculatedColumnNum = maxColumnNum;
      }

      setAdaptiveColumnNum(calculatedColumnNum);
    };

    const resizeObserver = new ResizeObserver(() => {
      // 使用 requestAnimationFrame 延迟到下一帧，确保DOM已更新
      requestAnimationFrame(() => {
        calculateColumnNum();
      });
    });

    // 延迟观察，确保 ref 已被赋值
    const observeContainer = () => {
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      } else {
        // 如果 ref 还未赋值，稍后重试
        requestAnimationFrame(observeContainer);
      }
    };
    observeContainer();

    // 监听窗口大小变化
    const handleWindowResize = () => {
      requestAnimationFrame(() => {
        calculateColumnNum();
      });
    };
    window.addEventListener("resize", handleWindowResize);

    // 初始计算（延迟执行以确保DOM已渲染）
    requestAnimationFrame(() => {
      calculateColumnNum();
    });

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleWindowResize);
    };
  }, [
    containerRef,
    totalColumnNum,
    enabled,
    minColumnNum,
    maxColumnNum,
    breakpoints,
    baseWidth,
  ]);

  return enabled ? adaptiveColumnNum : totalColumnNum;
}
