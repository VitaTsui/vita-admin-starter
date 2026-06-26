import * as echarts from "echarts";

import {
  ChartCommonProps,
  ChartOptionType,
  ChartsOption,
  SeriesData,
} from "..";
import React, { useCallback, useEffect, useMemo, useRef } from "react";

import styles from "../index.module.less";

export interface ChartGaugeProps extends ChartCommonProps {
  color?: string[] | string;
  seriesData?: SeriesData[];
}

const Gauge: React.FC<ChartGaugeProps> = (props) => {
  const { className, style, series = {}, seriesData } = props;
  const {
    pointer,
    detail,
    axisLine,
    axisTick,
    splitLine,
    progress,
    axisLabel,
    title,
    color = "#1675FB",
    ...coreSeries
  } = series as echarts.GaugeSeriesOption;
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // 使用 useMemo 缓存 chart 配置
  const chartOption = useMemo(() => {
    const option: ChartsOption = {
      series: {
        type: "gauge",
        center: ["50%", "60%"],
        radius: "115%",
        color,
        pointer: {
          show: false,
          ...pointer,
        },
        detail: {
          show: true,
          offsetCenter: [0, "-10%"],
          color: "inherit",
          ...detail,
        },
        title: {
          show: true,
          offsetCenter: [0, "30%"],
          ...title,
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: [[1, "#EAEDF2"]],
            width: 14,
          },
          ...axisLine,
        },
        axisTick: {
          show: false,
          ...axisTick,
        },
        progress: {
          show: true,
          roundCap: false,
          width: 14,
          ...progress,
        },
        splitLine: {
          show: false,
          ...splitLine,
        },
        axisLabel: {
          show: false,
          ...axisLabel,
        },
        data: seriesData,
        ...coreSeries,
      },
    };

    return option;
  }, [
    color,
    pointer,
    detail,
    title,
    axisLine,
    axisTick,
    progress,
    splitLine,
    axisLabel,
    seriesData,
    coreSeries,
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

    // 清理函数
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [chartOption, handleResize]);

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

export default Gauge;
