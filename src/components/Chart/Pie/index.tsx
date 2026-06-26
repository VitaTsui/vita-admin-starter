import * as echarts from "echarts";

import {
  ChartCommonProps,
  ChartOptionType,
  ChartsOption,
  Series,
  SeriesDataType,
} from "..";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { autoScrollLegend } from "../chartUtils";

import styles from "../index.module.less";
import ChartPie3D, { ChartPie3DProps } from "./Pie3D";

export interface ChartPieProps extends ChartCommonProps {
  chartTitle?: string;
  seriesData?: SeriesDataType;
  onChart?: (chart: echarts.EChartsType) => void;
  extendSeries?: Series[];
  onClick?: (event: echarts.ECElementEvent) => void;
  /** 是否启用图例自动滚动，默认 false */
  enableLegendAutoScroll?: boolean;
  /** 图例每页可见数量，默认 8 */
  legendVisibleCount?: number;
  /** 图例滚动间隔时间(ms)，默认 1500 */
  legendScrollInterval?: number;
  /** 是否半圆，默认 false */
  isSemiCircle?: boolean;
  /** 半圆贴边位置，默认 'bottom' */
  position?: "top" | "bottom" | "left" | "right";
  /** 显示角度，默认 180 */
  spanAngle?: number;
  /** 中心位置 */
  center?: [string, string];
  /** 半径配置 */
  radius?: [string, string];
}

export interface ChartPieFC extends React.FC<ChartPieProps> {
  Three: React.FC<ChartPie3DProps>;
}

const ChartPie: ChartPieFC = (props) => {
  const {
    className,
    style,
    chartTitle,
    seriesData,
    legend,
    tooltip,
    series,
    title,
    onChart,
    extendSeries = [],
    onClick,
    enableLegendAutoScroll = false,
    legendVisibleCount = 8,
    legendScrollInterval = 1500,
    isSemiCircle = false,
    position = "bottom",
    spanAngle = 180,
    center,
    radius,
    ...coreOption
  } = props;
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const legendScrollRef = useRef<ReturnType<typeof autoScrollLegend> | null>(
    null
  );

  // 根据 position 计算默认 radius（如果未指定）
  const calculatedRadius = useMemo(() => {
    if (radius) {
      return radius;
    }

    // 对于半圆，需要更大的 radius 值才能占满容器
    // 因为半圆只占 180 度，所以外半径需要更大才能覆盖整个容器的高度或宽度
    if (isSemiCircle) {
      return ["0%", "200%"];
    }
    // 全圆
    return ["45%", "70%"];
  }, [radius, isSemiCircle]);

  // 计算角度和中心位置
  const { calculatedCenter, startAngle, endAngle, actualSpanAngle } =
    useMemo(() => {
      // 根据 position 计算默认 center（如果未指定）
      let calculatedCenter: [string, string] = center || ["30%", "50%"];
      let startAngle = 90;
      let endAngle = 450; // 360 + 90，从顶部开始
      const actualSpanAngle = isSemiCircle ? spanAngle : 360;

      if (isSemiCircle) {
        // 根据 position 计算角度和中心位置
        switch (position) {
          case "top":
            // 上半圆
            startAngle = 180;
            endAngle = 0;
            calculatedCenter = center || ["center", "0%"];
            break;
          case "bottom":
            // 下半圆
            startAngle = 0;
            endAngle = 180;
            calculatedCenter = center || ["center", "100%"];
            break;
          case "left":
            // 左半圆
            startAngle = 90;
            endAngle = 270;
            calculatedCenter = center || ["0%", "center"];
            break;
          case "right":
            // 右半圆
            startAngle = 270;
            endAngle = 90;
            calculatedCenter = center || ["100%", "center"];
            break;
        }
      } else {
        // 全圆
        calculatedCenter = center || ["30%", "50%"];
      }

      return {
        calculatedCenter,
        startAngle,
        endAngle,
        actualSpanAngle,
      };
    }, [isSemiCircle, position, center, spanAngle]);

  // 处理数据：如果是半圆，需要填充空白数据
  const processedSeriesData = useMemo(() => {
    if (!seriesData || !isSemiCircle) {
      return seriesData;
    }

    const originDataLen = seriesData.length;
    const repeatedMultiple = 360 / actualSpanAngle;
    const addDataLen = parseInt(String((repeatedMultiple - 1) * originDataLen));

    // 填充空白数据以形成半圆
    const emptyData = Array.from({ length: addDataLen }, () => ({
      value: 0,
      itemStyle: {
        color: "rgba(0,0,0,0)",
      },
      tooltip: {
        show: false,
      },
    }));

    return [...seriesData, ...emptyData] as SeriesDataType;
  }, [seriesData, isSemiCircle, actualSpanAngle]);

  // 使用 useMemo 缓存 chart 配置
  const chartOption = useMemo(() => {
    // 当启用自动滚动时，隐藏分页按钮并设置为滚动类型
    const baseLegendConfig: echarts.LegendComponentOption = {
      orient: "vertical",
      top: "middle",
      right: "5%",
      icon: "circle",
      textStyle: {
        color: "#7B7B7B",
        fontSize: 14,
      },
      ...legend,
    };

    const legendConfig: echarts.LegendComponentOption = enableLegendAutoScroll
      ? {
          ...baseLegendConfig,
          // 设置为滚动类型
          type: "scroll",
          // 隐藏分页按钮的配置
          pageIconSize: 0,
          pageIconColor: "transparent",
          pageIconInactiveColor: "transparent",
          pageTextStyle: {
            color: "transparent",
          },
        }
      : baseLegendConfig;

    const option: ChartsOption = {
      title: {
        left: "center",
        top: "center",
        textAlign: "center",
        text: chartTitle || "",
        ...title,
      },
      legend: legendConfig,
      tooltip: {
        trigger: "item",
        ...tooltip,
      },
      series: [
        {
          data: processedSeriesData,
          type: "pie",
          center: calculatedCenter,
          radius: calculatedRadius,
          startAngle,
          endAngle,
          clockwise: false,
          label: {
            show: false,
          },
          ...series,
        } as ChartOptionType,
        ...extendSeries,
      ],
      ...coreOption,
    };

    return option;
  }, [
    chartTitle,
    title,
    legend,
    tooltip,
    processedSeriesData,
    series,
    extendSeries,
    coreOption,
    enableLegendAutoScroll,
    calculatedCenter,
    calculatedRadius,
    startAngle,
    endAngle,
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

    // 图例自动滚动
    if (enableLegendAutoScroll && seriesData && seriesData.length > 0) {
      // 清理之前的滚动实例
      if (legendScrollRef.current) {
        legendScrollRef.current.dispose();
      }

      legendScrollRef.current = autoScrollLegend({
        chart,
        total: seriesData.length,
        visibleCount: legendVisibleCount,
        interval: legendScrollInterval,
        autoStart: true,
      });
    }

    // 清理函数
    return () => {
      window.removeEventListener("resize", handleResize);

      if (onClick) {
        chartInstanceRef.current?.off("click", onClick);
      }

      // 清理图例滚动
      if (legendScrollRef.current) {
        legendScrollRef.current.dispose();
        legendScrollRef.current = null;
      }
    };
  }, [
    chartOption,
    handleResize,
    onChart,
    onClick,
    enableLegendAutoScroll,
    seriesData,
    legendVisibleCount,
    legendScrollInterval,
  ]);

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

ChartPie.Three = ChartPie3D;

export default ChartPie;
