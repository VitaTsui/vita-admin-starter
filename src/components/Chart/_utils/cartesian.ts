import * as echarts from "echarts";
import { ChartOptionType, SeriesData, SeriesDataType } from "..";

export interface ChartScrollConfig {
  enabled?: boolean;
  autoScroll?: boolean;
  windowSize?: number;
  interval?: number;
  startIndex?: number;
  sliderVisible?: boolean;
  wheelModeWhenSliderHidden?: "scroll" | "none";
}

export interface NormalizedScrollConfig {
  zoomEnabled: boolean;
  autoScroll: boolean;
  windowSize: number;
  interval: number;
  startIndex: number;
  sliderVisible?: boolean;
  wheelModeWhenSliderHidden: "scroll" | "none";
}

export const createDefaultCategoryXAxis = (
  xAxisData?: Array<string>,
): ChartOptionType => ({
  type: "category",
  boundaryGap: true,
  data: xAxisData,
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

export const createDefaultValueYAxis = (
  mode: "bar" | "line" = "bar",
): ChartOptionType => ({
  type: "value",
  axisLabel: {
    textStyle: {
      fontSize: 14,
      color: "#373D48",
    },
  },
  splitLine:
    mode === "line"
      ? {
          lineStyle: {
            color: "#C9CED6",
            type: "dashed",
          },
        }
      : {
          show: false,
        },
});

export const buildCartesianSeriesOptions = (
  mode: "bar" | "line",
  seriesData?: SeriesDataType,
  series?: echarts.SeriesOption | echarts.SeriesOption[],
) => {
  const seriesStyle: echarts.SeriesOption =
    mode === "bar"
      ? ({
          type: "bar",
          barWidth: 20,
        } as echarts.BarSeriesOption)
      : ({
          type: "line",
          symbol: "circle",
          symbolSize: 8,
        } as echarts.LineSeriesOption);

  if (
    !seriesData ||
    seriesData.length === 0 ||
    typeof seriesData[0] !== "object"
  ) {
    if (Array.isArray(series)) {
      return series.map((item) => ({
        data: seriesData,
        ...seriesStyle,
        ...item,
      }));
    }

    return [
      {
        data: seriesData,
        ...seriesStyle,
        ...(series || {}),
      },
    ];
  }

  const typedSeriesData = seriesData as SeriesData[];
  if (Array.isArray(series)) {
    return series.flatMap((item) =>
      typedSeriesData.map((serie) => ({
        name: serie?.name,
        data: serie?.value,
        ...seriesStyle,
        ...item,
        ...serie?.series,
      })),
    );
  }

  return typedSeriesData.map((serie) => ({
    name: serie?.name,
    data: serie?.value,
    ...seriesStyle,
    ...(series || {}),
    ...serie?.series,
  }));
};

export const getSliderShow = (
  zoom?: echarts.DataZoomComponentOption | Record<string, unknown>,
) => {
  if (!zoom || typeof zoom !== "object") return undefined;
  const maybeShow = (zoom as { show?: unknown }).show;
  return typeof maybeShow === "boolean" ? maybeShow : undefined;
};

export const resolveScrollConfig = (
  scrollConfig?: ChartScrollConfig,
): NormalizedScrollConfig => ({
  zoomEnabled: scrollConfig?.enabled ?? false,
  autoScroll: scrollConfig?.autoScroll ?? false,
  windowSize: scrollConfig?.windowSize ?? 10,
  interval: scrollConfig?.interval ?? 2000,
  startIndex: scrollConfig?.startIndex ?? 0,
  sliderVisible: scrollConfig?.sliderVisible,
  wheelModeWhenSliderHidden:
    scrollConfig?.wheelModeWhenSliderHidden ?? "scroll",
});
