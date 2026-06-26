import * as echarts from "echarts";

import ChartBar, { ChartBarProps } from "./Bar";
import ChartPolar, { ChartPolarProps } from "./Polar";
import ChartGroup, { ChartGroupProps } from "./Group";
import ChartLine, { ChartLineProps } from "./Line";
import ChartPie, { ChartPieFC, ChartPieProps } from "./Pie";
import ChartGauge, { ChartGaugeProps } from "./Gauge";
import ChartSankey, { ChartSankeyProps } from "./Sankey";
import ChartTree, { ChartTreeProps } from "./Tree";
import ChartBubble, { ChartBubbleProps } from "./Bubble";
import ChartHeatmap, { ChartHeatmapProps } from "./Heatmap";
import ChartRadar, { ChartRadarProps } from "./Radar";
import React, { CSSProperties } from "react";
import ChartCommon from "./Common";

export type CommonObj<T = unknown> = Record<string, T>;

/**
 * ChartTypes
 * ChartOptionsType
 *
 * 关联 Group
 */
export type ChartTypes = "Line" | "Bar" | "Pie";
export type ChartOptionsType = ChartLineProps | ChartBarProps | ChartPieProps;

export type ChartOptionType = CommonObj;

export type ChartsOption = echarts.EChartsOption;

export type Series = echarts.SeriesOption & ChartOptionType;

export interface SeriesData<T = number | undefined> {
  series?: Series;
  value: T;
  name?: string;
  [key: string]: unknown;
}
export type SeriesDataType = Array<
  SeriesData<number | (number | undefined)[] | undefined> | (number | undefined)
>;

interface VarCSSProperties {
  [key: string]: string | number | undefined;
}
export type ChartCSSProperties = VarCSSProperties & CSSProperties;

export interface ChartCommonProps extends ChartsOption {
  className?: string;
  style?: ChartCSSProperties;
  insideDataZoom?: echarts.DataZoomComponentOption;
  sliderDataZoom?: echarts.DataZoomComponentOption;
  /** 图表实例就绪回调，可用于图例自动滚动等 */
  onChart?: (chart: echarts.ECharts) => void;
}

interface ChartType {
  Group: React.FC<ChartGroupProps>;
  Line: React.FC<ChartLineProps>;
  Bar: React.FC<ChartBarProps>;
  Pie: ChartPieFC;
  Polar: React.FC<ChartPolarProps>;
  Gauge: React.FC<ChartGaugeProps>;
  Sankey: React.FC<ChartSankeyProps>;
  Tree: React.FC<ChartTreeProps>;
  Bubble: React.FC<ChartBubbleProps>;
  Heatmap: React.FC<ChartHeatmapProps>;
  Radar: React.FC<ChartRadarProps>;
  Common: React.FC<ChartCommonProps>;
}

const Chart: ChartType = {
  Group: ChartGroup,
  Line: ChartLine,
  Bar: ChartBar,
  Pie: ChartPie,
  Polar: ChartPolar,
  Gauge: ChartGauge,
  Sankey: ChartSankey,
  Tree: ChartTree,
  Bubble: ChartBubble,
  Heatmap: ChartHeatmap,
  Radar: ChartRadar,
  Common: ChartCommon,
};

export default Chart;
