import React, { useCallback, useEffect, useMemo, useRef } from "react";
import styles from "../index.module.less";
import { ChartCommonProps, ChartOptionType, ChartsOption } from "..";
import * as echarts from "echarts";
import {
  createDefaultHeatmapXAxis,
  createDefaultHeatmapYAxis,
} from "../_utils/heatmap";

export interface HeatmapDataItem {
  /** X 轴索引或名称 */
  x: number | string;
  /** Y 轴索引或名称 */
  y: number | string;
  /** 热力值（业务实际数值，如 tooltip 应展示此字段） */
  value: number;
  /** 可选：仅用于着色与 visualMap，不传则与 value 相同 */
  visualWeight?: number;
}

export interface ChartHeatmapProps extends ChartCommonProps {
  /** 热力图数据，格式为 [[x, y, value]] 或 HeatmapDataItem[] */
  data: Array<[number, number, number]> | HeatmapDataItem[];
  /** X 轴数据（类别名称） */
  xAxisData?: string[];
  /** Y 轴数据（类别名称） */
  yAxisData?: string[];
  /** 图表标题 */
  chartTitle?: string;
  /** visualMap 配置 */
  visualMap?: echarts.VisualMapComponentOption;
  /** 图表实例回调 */
  onChart?: (chart: echarts.EChartsType) => void;
  /** 点击事件 */
  onClick?: (event: echarts.ECElementEvent) => void;
  /** 0值颜色 */
  zeroColor?: string | false;
  /** inRangeColor */
  inRangeColor?: string[];
}

const Heatmap: React.FC<ChartHeatmapProps> = (props) => {
  const {
    className,
    style,
    data,
    xAxisData,
    yAxisData,
    chartTitle,
    visualMap: propVisualMap,
    series,
    tooltip,
    title,
    grid,
    xAxis,
    yAxis,
    onChart,
    onClick,
    zeroColor,
    inRangeColor = [
      "#8BCCFB",
      "#75C3FB",
      "#5AB5F6",
      "#42AEFA",
      "#2DA1F5",
      "#0F89E1",
      "#056FBB",
      "#025794",
      "#0A4089",
    ],
    ...coreOption
  } = props;
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // 处理数据并生成图表配置
  const chartOption = useMemo(() => {
    if (!data || data.length === 0) {
      return {} as ChartsOption;
    }

    // 转换数据格式为 ECharts 需要的格式 [[x, y, value]]
    let processedData: Array<[number, number, number]>;
    if (Array.isArray(data) && data.length > 0) {
      if (Array.isArray(data[0])) {
        // 已经是 [[x, y, value]] 格式
        processedData = data as Array<[number, number, number]>;
      } else {
        // 是 HeatmapDataItem[] 格式，需要转换
        processedData = (data as HeatmapDataItem[])?.map((item) => {
          const xIndex =
            typeof item.x === "number"
              ? item.x
              : xAxisData?.indexOf(item.x as string) ?? 0;
          const yIndex =
            typeof item.y === "number"
              ? item.y
              : yAxisData?.indexOf(item.y as string) ?? 0;
          const z =
            item.visualWeight !== undefined ? item.visualWeight : item.value;
          return [xIndex, yIndex, z];
        });
      }
    } else {
      processedData = [];
    }

    // 计算值的范围用于 visualMap
    const values = processedData?.map((item) => item[2]);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    // 默认 visualMap 配置
    const defaultVisualMap: echarts.VisualMapComponentOption = {
      min: minValue,
      max: maxValue,
      calculable: true,
      orient: "vertical",
      left: "right",
      top: "center",
      textStyle: {
        color: "#373D48",
      },
      inRange: {
        color: inRangeColor,
      },
    };

    // 处理 xAxis 配置
    const def_xAxis = createDefaultHeatmapXAxis(xAxisData);
    const processedXAxis = Array.isArray(xAxis)
      ? xAxis?.map((item) => ({
          ...def_xAxis,
          data: item?.type === "value" ? undefined : xAxisData,
          ...item,
        }))
      : {
          ...def_xAxis,
          data: xAxis?.type === "value" ? undefined : xAxisData,
          ...xAxis,
        };

    // 处理 yAxis 配置
    const def_yAxis = createDefaultHeatmapYAxis(yAxisData);
    const processedYAxis = Array.isArray(yAxis)
      ? yAxis?.map((item) => ({
          ...def_yAxis,
          data: item?.type === "value" ? undefined : yAxisData,
          ...item,
        }))
      : {
          ...def_yAxis,
          data: yAxis?.type === "value" ? undefined : yAxisData,
          ...yAxis,
        };

    // 处理 visualMap 配置
    const finalVisualMap = {
      ...defaultVisualMap,
      ...propVisualMap,
    };

    // 计算 grid 配置
    const gridConfig: echarts.GridComponentOption = {
      height: "95%",
      top: "5%",
      right: "5%",
      containLabel: true,
    };

    // 根据 visualMap 的显示状态和方向设置 grid 的 right 或 bottom
    if (finalVisualMap.show !== false) {
      const orient = finalVisualMap.orient || defaultVisualMap.orient;
      if (orient === "vertical") {
        gridConfig.right = "15%";
      } else if (orient === "horizontal") {
        gridConfig.bottom = "15%";
      }
    }

    // 合并用户传入的 grid 配置
    Object.assign(gridConfig, grid);

    const option: ChartsOption = {
      title: {
        text: chartTitle || "",
        ...title,
      },
      tooltip: {
        position: "top",
        ...tooltip,
      },
      grid: gridConfig,
      xAxis: processedXAxis,
      yAxis: processedYAxis,
      visualMap: finalVisualMap,
      series: [
        {
          type: "heatmap",
          data: processedData?.map((item) => {
            return {
              value: item,
              itemStyle: {
                color:
                  item[2] === 0
                    ? zeroColor === false
                      ? undefined
                      : zeroColor
                    : undefined,
              },
            };
          }),
          label: {
            show: true,
            position: "inside",
            color: "#fff",
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
          ...series,
        } as ChartOptionType,
      ],
      ...coreOption,
    };

    return option;
  }, [
    data,
    inRangeColor,
    xAxisData,
    xAxis,
    yAxisData,
    yAxis,
    propVisualMap,
    grid,
    chartTitle,
    title,
    tooltip,
    series,
    coreOption,
    zeroColor,
  ]);

  // 处理图表 resize 的回调
  const handleResize = useCallback(() => {
    chartInstanceRef.current?.resize();
  }, []);

  // 初始化图表
  useEffect(() => {
    if (!chartRef.current) return;

    // 初始化或获取已存在的实例
    let chart = chartInstanceRef.current;
    if (!chart) {
      chart = echarts.init(chartRef.current);
      chartInstanceRef.current = chart;
      // 首次初始化时调用 onChart 回调
      onChart?.(chart);
    }

    // 设置配置
    chart.setOption(chartOption as ChartOptionType, true);

    // 添加 resize 监听
    window.addEventListener("resize", handleResize);

    // 添加 ResizeObserver
    if (chartRef.current && !resizeObserverRef.current) {
      resizeObserverRef.current = new ResizeObserver(handleResize);
      resizeObserverRef.current.observe(chartRef.current);
    }

    // 添加点击事件
    if (onClick) {
      chartInstanceRef.current?.on("click", onClick);
    }

    // 清理函数
    return () => {
      window.removeEventListener("resize", handleResize);

      if (onClick) {
        chartInstanceRef.current?.off("click", onClick);
      }
    };
  }, [chartOption, handleResize, onChart, onClick]);

  // 组件卸载时清理资源
  useEffect(() => {
    return () => {
      // 清理 ResizeObserver
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      // 销毁图表实例
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose();
        chartInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div
      className={`${styles["chart-container"]} ${className ?? ""}`}
      style={style}
    >
      <div ref={chartRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default Heatmap;
