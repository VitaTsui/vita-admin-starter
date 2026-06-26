import * as echarts from "echarts";
import {
  ChartCommonProps,
  ChartOptionType,
  ChartsOption,
  SeriesData,
} from "..";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import styles from "../index.module.less";

export interface ChartPolarProps extends ChartCommonProps {
  title1?: string;
  title1Style?: echarts.TitleComponentOption["textStyle"];
  title2?: string;
  title2Style?: echarts.TitleComponentOption["textStyle"];
  seriesData: SeriesData;
  color?: string[] | string;
}

const Polar: React.FC<ChartPolarProps> = (props) => {
  const {
    className,
    style,
    polar,
    radiusAxis,
    angleAxis,
    series,
    title1,
    title1Style,
    title2,
    title2Style,
    textStyle,
    seriesData,
    color = ["#00FFA3", "#00FFA3"],
    ...coreOption
  } = props;
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // 使用 useMemo 缓存 chart 配置
  const chartOption = useMemo(() => {
    const option: ChartsOption = {
      title: [
        {
          left: "center",
          top: "45%",
          textVerticalAlign: "middle",
          textStyle: {
            fontSize: 18,
            color: "#333",
            rich: {
              a: {
                fontSize: 30,
                fontWeight: "bold",
                color: "#fff",
              },
              b: {
                fontSize: 18,
                color: "#fff",
              },
            },
            ...textStyle,
            ...title1Style,
          },
          text: title1 || "",
        },
        {
          left: "center",
          top: "90%",
          textVerticalAlign: "middle",
          textStyle: {
            rich: {
              a: {
                fontSize: 18,
                color: "rgba(255,255,255,0.7)",
                padding: [20, 0, 0, 0],
              },
            },
            ...textStyle,
            ...title2Style,
          },
          text: title2 || "",
        },
      ],
      tooltip: {
        show: false,
      },
      polar: {
        radius: ["60%", "80%"],
        center: ["50%", "45%"],
        ...polar,
      },
      radiusAxis: {
        type: "category",
        show: false,
        inverse: true,
        axisLabel: {
          show: false,
        },
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        ...radiusAxis,
      },
      angleAxis: {
        max: 100,
        show: false,
        axisPointer: {
          show: false,
          label: {
            show: false,
          },
          lineStyle: {
            opacity: 0,
          },
        },
        ...angleAxis,
      },
      series: {
        type: "bar",
        name: seriesData.name,
        data: [seriesData.value],
        coordinateSystem: "polar",
        showBackground: true,
        roundCap: true,
        itemStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: Array.isArray(color) ? color[0] : color,
              },
              {
                offset: 1,
                color: Array.isArray(color) ? color[1] : color,
              },
            ],
            global: false,
          },
        },
        ...series,
      } as ChartOptionType,
      ...coreOption,
    };

    return option;
  }, [
    textStyle,
    title1Style,
    title1,
    title2Style,
    title2,
    polar,
    radiusAxis,
    angleAxis,
    seriesData,
    color,
    series,
    coreOption,
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

export default Polar;
