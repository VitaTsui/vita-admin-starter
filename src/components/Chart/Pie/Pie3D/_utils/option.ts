import * as echarts from "echarts";
import { ChartsOption } from "../../..";
import chartTooltipFormatter from "../../../chartUtils/chartTooltipFormatter";
import type { Pie3DDataItem, SeriesItem, LabelConfig } from "..";
import { calculateK, createSeries } from "./series";
import { createLabelSeries } from "./label";

const DEFAULT_COLORS = [
  "#5470c6",
  "#91cc75",
  "#fac858",
  "#ee6666",
  "#73c0de",
  "#3ba272",
  "#fc8452",
  "#9a60b4",
  "#ea7ccc",
];

export const getPie3DOption = (
  data: Pie3DDataItem[],
  config: {
    internalDiameterRatio: number;
    tooltip?: unknown;
    alpha: number;
    beta: number;
    autoRotate: boolean;
    distance: number;
    coreOption: ChartsOption;
    optionRef: React.MutableRefObject<ChartsOption | null>;
    minHeight?: number;
    maxHeight?: number;
    yOffset?: number;
    label?: LabelConfig;
    enableMouseControl?: boolean;
  }
) => {
  const {
    internalDiameterRatio,
    tooltip,
    alpha,
    beta,
    autoRotate,
    distance,
    coreOption,
    optionRef,
    minHeight = 10,
    maxHeight = 35,
    yOffset = 0,
    label,
    enableMouseControl = false,
  } = config;

  const k = calculateK(internalDiameterRatio);
  const effectiveYOffset = autoRotate ? 0 : yOffset;

  const series = createSeries(data, k, minHeight, maxHeight, effectiveYOffset);

  const maxValue = data.length ? Math.max(...data.map((item) => item.value)) : 0;
  const colorPalette =
    (coreOption as { color?: string[] }).color || DEFAULT_COLORS;

  const labelSeries = label?.show
    ? createLabelSeries(
        series,
        label,
        maxValue,
        minHeight,
        maxHeight,
        autoRotate,
        yOffset,
        alpha,
        colorPalette
      )
    : [];

  const tooltipConfig = tooltip || {};
  const option: ChartsOption & { series: SeriesItem[] } = {
    ...coreOption,
    color: colorPalette,
    tooltip: {
      formatter: (params: echarts.TooltipComponentFormatterCallbackParams) => {
        const param = params as echarts.ECElementEvent;
        if (
          param.seriesName !== "mouseoutSeries" &&
          optionRef.current &&
          typeof param.seriesIndex === "number"
        ) {
          const currentOption = optionRef.current as ChartsOption & {
            series: SeriesItem[];
          };
          return chartTooltipFormatter({
            params: {
              ...params,
              value: currentOption.series[param.seriesIndex].pieData.value,
              color: param.color,
              name: param.seriesName,
            },
          });
        }
        return "";
      },
      ...tooltipConfig,
    },
    xAxis3D: {
      min: -1,
      max: 1,
    },
    yAxis3D: {
      min: -1,
      max: 1,
    },
    zAxis3D: {
      min: -1,
      max: 1,
    },
    grid3D: {
      show: false,
      boxHeight: 20,
      top: "-5%",
      viewControl: {
        alpha,
        beta,
        rotateSensitivity: enableMouseControl ? 1 : 0,
        zoomSensitivity: enableMouseControl ? 1 : 0,
        panSensitivity: enableMouseControl ? 1 : 0,
        autoRotate,
        distance,
      },
      postEffect: {
        enable: autoRotate ? false : true,
        bloom: {
          enable: true,
          bloomIntensity: 0.1,
        },
        SSAO: {
          enable: true,
          quality: "medium",
          radius: 2,
        },
      },
    },
    series: [...series, ...labelSeries] as unknown as echarts.SeriesOption[],
  } as unknown as ChartsOption & { series: SeriesItem[] };

  return option;
};
