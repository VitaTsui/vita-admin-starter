import React, { useCallback, useEffect, useMemo, useRef } from "react";
import styles from "../index.module.less";
import {
  ChartCommonProps,
  ChartOptionType,
  ChartsOption,
  SeriesData,
} from "..";
import * as echarts from "echarts";
import { deepCopy } from "hsu-utils";
import { handleTreeData } from "../_utils/tree";

export interface ChartTreeProps extends ChartCommonProps {
  seriesData: SeriesData[];
  getImage?: (img: string) => void;
}

const Tree: React.FC<ChartTreeProps> = (props) => {
  const { className, style, seriesData, series, getImage } = props;
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // 使用 useMemo 缓存 chart 配置
  const chartOption = useMemo(() => {
    const option: ChartsOption = {
      series: {
        type: "tree",
        data: handleTreeData(deepCopy(seriesData), 0),
        left: "10%",
        right: "10%",
        top: "10%",
        bottom: "10%",
        ...series,
      } as ChartOptionType,
    };

    return option;
  }, [seriesData, series]);

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

      // 首次初始化时添加 finished 事件监听
      chart.on("finished", () => {
        getImage?.(
          chart!.getDataURL({
            type: "png",
            pixelRatio: 1,
            backgroundColor: "#fff",
          })
        );
      });
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
  }, [chartOption, handleResize, getImage]);

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
        chartInstanceRef.current.off("finished");
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

export default Tree;
