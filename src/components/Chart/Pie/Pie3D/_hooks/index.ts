import { useCallback } from "react";
import * as echarts from "echarts";
import { ChartsOption, ChartOptionType } from "../../..";
import { getParametricEquation } from "../_utils/parametricEquation";
import type { SeriesItem } from "..";

// 获取饼图扇区的数量（不包括标签系列）
const getPieSeriesCount = (series: SeriesItem[]): number => {
  return series.filter((s) => s.type === "surface").length;
};

const getMaxPieValue = (series: SeriesItem[]): number => {
  const values = series
    .filter((s) => s.pieData && s.pieData.value !== undefined)
    .map((s) => s.pieData.value);
  if (!values.length) return 1;

  return Math.max(1, ...values);
};

// 高亮标签
const highlightLabel = (
  option: ChartsOption & { series: SeriesItem[] },
  pieIndex: number
) => {
  const pieSeriesCount = getPieSeriesCount(option.series);
  const lineIndex = pieSeriesCount + pieIndex;
  const scatterIndex = pieSeriesCount * 2 + pieIndex;

  // 高亮线条
  if (lineIndex < option.series.length) {
    const lineSeries = option.series[
      lineIndex
    ] as unknown as echarts.SeriesOption & {
      lineStyle?: { color?: string; width?: number };
      _originalWidth?: number;
    };
    if (lineSeries && lineSeries.lineStyle) {
      // 保存原始宽度（如果还没有保存）
      if (lineSeries._originalWidth === undefined) {
        lineSeries._originalWidth = lineSeries.lineStyle.width || 1;
      }
      // 高亮：只增加宽度，不改变颜色
      lineSeries.lineStyle.width = (lineSeries._originalWidth || 1) * 2;
    }
  }

  // 高亮文本
  if (scatterIndex < option.series.length) {
    const scatterSeries = option.series[
      scatterIndex
    ] as unknown as echarts.SeriesOption & {
      label?: {
        textStyle?: { color?: string; fontSize?: number };
      };
      _originalFontSize?: number;
    };
    if (scatterSeries && scatterSeries.label && scatterSeries.label.textStyle) {
      const textStyle = scatterSeries.label.textStyle;
      // 保存原始字体大小（如果还没有保存）
      if (scatterSeries._originalFontSize === undefined) {
        scatterSeries._originalFontSize = textStyle.fontSize || 14;
      }
      // 高亮：只增加字体大小，不改变颜色
      textStyle.fontSize = (scatterSeries._originalFontSize || 14) * 1.2;
    }
  }
};

// 取消标签高亮
const unhighlightLabel = (
  option: ChartsOption & { series: SeriesItem[] },
  pieIndex: number
) => {
  const pieSeriesCount = getPieSeriesCount(option.series);
  const lineIndex = pieSeriesCount + pieIndex;
  const scatterIndex = pieSeriesCount * 2 + pieIndex;

  // 恢复线条样式
  if (lineIndex < option.series.length) {
    const lineSeries = option.series[
      lineIndex
    ] as unknown as echarts.SeriesOption & {
      lineStyle?: { color?: string; width?: number };
      _originalWidth?: number;
    };
    if (
      lineSeries &&
      lineSeries.lineStyle &&
      lineSeries._originalWidth !== undefined
    ) {
      lineSeries.lineStyle.width = lineSeries._originalWidth;
    }
  }

  // 恢复文本样式
  if (scatterIndex < option.series.length) {
    const scatterSeries = option.series[
      scatterIndex
    ] as unknown as echarts.SeriesOption & {
      label?: {
        textStyle?: { color?: string; fontSize?: number };
      };
      _originalFontSize?: number;
    };
    if (
      scatterSeries &&
      scatterSeries.label &&
      scatterSeries.label.textStyle &&
      scatterSeries._originalFontSize !== undefined
    ) {
      scatterSeries.label.textStyle.fontSize = scatterSeries._originalFontSize;
    }
  }
};

export const useMouseOverHandler = (
  optionRef: React.MutableRefObject<ChartsOption | null>,
  chartInstanceRef: React.MutableRefObject<echarts.ECharts | null>,
  hoveredIndexRef: React.MutableRefObject<number | "">,
  config: {
    hoverHeightIncrement: number;
    minHeight?: number;
    maxHeight?: number;
    yOffset?: number;
    autoRotate?: boolean;
  }
) => {
  const {
    hoverHeightIncrement,
    minHeight = 10,
    maxHeight = 35,
    yOffset = 0,
    autoRotate = false,
  } = config;
  const effectiveYOffset = autoRotate ? 0 : yOffset;

  return useCallback(
    (params: echarts.ECElementEvent) => {
      if (!optionRef.current || typeof params.seriesIndex !== "number") return;

      const option = optionRef.current as ChartsOption & {
        series: SeriesItem[];
      };
      const chart = chartInstanceRef.current;
      if (!chart) return;

      if (hoveredIndexRef.current === params.seriesIndex) {
        return;
      }

      if (
        hoveredIndexRef.current !== "" &&
        option.series[hoveredIndexRef.current]?.pieData
      ) {
        const idx = hoveredIndexRef.current as number;
        const isSelected = option.series[idx].pieStatus.selected;
        const startRatio = option.series[idx].pieData.startRatio!;
        const endRatio = option.series[idx].pieData.endRatio!;
        const k = option.series[idx].pieStatus.k;

        const maxValue = getMaxPieValue(option.series);
        const heightRatio = option.series[idx].pieData.value / maxValue;
        const h = minHeight + (maxHeight - minHeight) * heightRatio;

        option.series[idx].parametricEquation = getParametricEquation(
          startRatio,
          endRatio,
          isSelected,
          false,
          k,
          h,
          effectiveYOffset
        );
        option.series[idx].pieStatus.hovered = false;

        // 取消之前高亮的标签
        unhighlightLabel(option, idx);

        hoveredIndexRef.current = "";
      }

      if (
        params.seriesName !== "mouseoutSeries" &&
        option.series[params.seriesIndex]?.pieData
      ) {
        const seriesIndex = params.seriesIndex;
        const isSelected = option.series[seriesIndex].pieStatus.selected;
        const startRatio = option.series[seriesIndex].pieData.startRatio!;
        const endRatio = option.series[seriesIndex].pieData.endRatio!;
        const k = option.series[seriesIndex].pieStatus.k;

        const maxValue = getMaxPieValue(option.series);
        const heightRatio = option.series[seriesIndex].pieData.value / maxValue;
        const baseHeight = minHeight + (maxHeight - minHeight) * heightRatio;

        option.series[seriesIndex].parametricEquation = getParametricEquation(
          startRatio,
          endRatio,
          isSelected,
          true,
          k,
          baseHeight + hoverHeightIncrement,
          effectiveYOffset
        );
        option.series[seriesIndex].pieStatus.hovered = true;

        // 高亮对应的标签
        highlightLabel(option, seriesIndex);

        hoveredIndexRef.current = seriesIndex;
      }

      chart.setOption({ series: option.series } as unknown as ChartOptionType, {
        notMerge: false,
        lazyUpdate: false,
      });
    },
    [
      chartInstanceRef,
      hoverHeightIncrement,
      hoveredIndexRef,
      optionRef,
      minHeight,
      maxHeight,
      effectiveYOffset,
    ]
  );
};

export const useGlobalOutHandler = (
  optionRef: React.MutableRefObject<ChartsOption | null>,
  chartInstanceRef: React.MutableRefObject<echarts.ECharts | null>,
  hoveredIndexRef: React.MutableRefObject<number | "">,
  config?: {
    minHeight?: number;
    maxHeight?: number;
    yOffset?: number;
    autoRotate?: boolean;
  }
) => {
  const {
    minHeight = 10,
    maxHeight = 35,
    yOffset = 0,
    autoRotate = false,
  } = config ?? {};
  const effectiveYOffset = autoRotate ? 0 : yOffset;

  return useCallback(() => {
    if (!optionRef.current) return;

    const option = optionRef.current as ChartsOption & { series: SeriesItem[] };
    const chart = chartInstanceRef.current;
    if (!chart) return;

    if (
      hoveredIndexRef.current !== "" &&
      option.series[hoveredIndexRef.current]?.pieData
    ) {
      const idx = hoveredIndexRef.current as number;
      const isSelected = option.series[idx].pieStatus.selected;
      const startRatio = option.series[idx].pieData.startRatio!;
      const endRatio = option.series[idx].pieData.endRatio!;
      const k = option.series[idx].pieStatus.k;

      const maxValue = getMaxPieValue(option.series);
      const heightRatio = option.series[idx].pieData.value / maxValue;
      const h = minHeight + (maxHeight - minHeight) * heightRatio;

      option.series[idx].parametricEquation = getParametricEquation(
        startRatio,
        endRatio,
        isSelected,
        false,
        k,
        h,
        effectiveYOffset
      );
      option.series[idx].pieStatus.hovered = false;

      // 取消标签高亮
      unhighlightLabel(option, idx);

      hoveredIndexRef.current = "";
    }

    chart.setOption({ series: option.series } as unknown as ChartOptionType, {
      notMerge: false,
      lazyUpdate: false,
    });
  }, [
    chartInstanceRef,
    hoveredIndexRef,
    optionRef,
    minHeight,
    maxHeight,
    effectiveYOffset,
  ]);
};
