import { ChartOptionType } from "..";

export const createDefaultHeatmapXAxis = (
  xAxisData?: string[],
): ChartOptionType => ({
  type: "category",
  data: xAxisData,
  splitArea: {
    show: true,
  },
  axisLabel: {
    interval: 0,
    hideOverlap: true,
    textStyle: {
      fontSize: 14,
      color: "#373D48",
    },
  },
  axisTick: {
    show: false,
  },
});

export const createDefaultHeatmapYAxis = (
  yAxisData?: string[],
): ChartOptionType => ({
  type: "category",
  data: yAxisData,
  splitArea: {
    show: true,
  },
  axisLabel: {
    textStyle: {
      fontSize: 14,
      color: "#373D48",
    },
  },
  axisTick: {
    show: false,
  },
});
