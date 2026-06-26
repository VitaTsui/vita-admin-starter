import React, { useCallback, useEffect, useMemo, useRef } from "react";
import styles from "../index.module.less";
import { ChartCommonProps, ChartOptionType, ChartsOption } from "..";
import * as echarts from "echarts";

type SankeyNodeItemOption = echarts.SankeySeriesOption["data"];
type SankeyEdgeItemOption = echarts.SankeySeriesOption["links"];

export interface ChartSankeyProps extends ChartCommonProps {
  seriesData: SankeyNodeItemOption;
  seriesLinks: SankeyEdgeItemOption;
  getImage?: (img: string) => void;
}

const Sankey: React.FC<ChartSankeyProps> = (props) => {
  const { className, style, seriesData, seriesLinks, series, getImage } = props;
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // 使用 useMemo 缓存 chart 配置
  const chartOption = useMemo(() => {
    const option: ChartsOption = {
      series: {
        type: "sankey",
        layout: "none",
        top: 0,
        left: 0,
        right: 180,
        bottom: 0,
        nodeGap: 1,
        layoutIterations: 0,
        data: seriesData?.map((item) => {
          return {
            name: item.name,
            itemStyle: {
              color: "#156FFF",
            },
            label: {
              position: "right",
              textStyle: {
                fontWeight: 800,
              },
            },
          };
        }),
        links: seriesLinks?.map((item) => {
          return { ...item, value: 10 };
        }),
        draggable: true,
        roam: true,
        focusNodeAdjacency: "allEdges",
        levels: [
          {
            depth: 0,
            itemStyle: {
              color: "yellow",
            },
            lineStyle: {
              color: "source",
              opacity: 0.2,
            },
          },
          {
            depth: 1,
            lineStyle: {
              color: "source",
              opacity: 0.2,
            },
          },
          {
            depth: 2,
            lineStyle: {
              color: "source",
              opacity: 0.2,
            },
          },
          {
            depth: 3,
            label: {
              fontSize: 12,
            },
          },
        ],
        label: {
          fontSize: 14,
          color: "#666",
        },
        itemStyle: {
          color: "transparent",
          borderColor: "transparent",
          borderWidth: 20,
        },
        ...series,
      } as ChartOptionType,
    };

    return option;
  }, [seriesData, seriesLinks, series]);

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

  function getMaxLevelCount() {
    if (!seriesData?.length) return 0;
    const level: Record<number, number> = {};
    seriesData?.forEach((v) => {
      const { level: _level } = v as unknown as { level: number };

      if (!level[_level]) {
        level[_level] = 1;
        return;
      }
      level[_level] += 1;
    });
    const max = Math.max(...Object.values(level));
    return max > 10 ? max : 10;
  }

  return (
    <div
      className={`${styles["chart-container"]} ${className ?? ""}`}
      style={style}
    >
      <div
        ref={chartRef}
        style={{
          width: "100%",
          height: "100%",
          minHeight: `${getMaxLevelCount() * 30}px`,
        }}
      />
    </div>
  );
};

export default Sankey;
