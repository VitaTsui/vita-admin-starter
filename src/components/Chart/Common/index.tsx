import React, { useCallback, useEffect, useMemo, useRef } from "react";
import styles from "../index.module.less";
import { ChartCommonProps, ChartOptionType, ChartsOption } from "..";
import * as echarts from "echarts";

const Common: React.FC<ChartCommonProps> = (props) => {
  const { className, style, onChart, ...coreOption } = props;
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // 使用 useMemo 缓存 chart 配置
  const chartOption = useMemo(() => {
    const option: ChartsOption = {
      ...coreOption,
    };

    return option;
  }, [coreOption]);

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

    // 图表就绪回调（可用于图例自动滚动等）
    onChart?.(chart);

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
  }, [chartOption, handleResize, onChart]);

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

export default Common;
