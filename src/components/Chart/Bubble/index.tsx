import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "../index.module.less";
import { ChartCommonProps, ChartOptionType, ChartsOption } from "..";
import * as echarts from "echarts";
import {
  defaultBubbleColorList,
  drawCircles,
} from "../_utils/bubble";

export interface BubbleDataItem {
  name: string;
  value: number;
  [key: string]: unknown;
}

// 扩展的数据项类型，包含图表需要的所有属性
interface ExtendedBubbleDataItem extends BubbleDataItem {
  id: number;
  x?: number;
  y?: number;
  symbolSize?: number;
  label?: {
    normal: {
      show: boolean;
      color: string;
      fontSize?: number;
      width?: number;
      overflow?: "truncate" | "break" | "breakAll";
      ellipsis?: string;
    };
  };
  itemStyle?: {
    normal: {
      color: echarts.Color;
    };
  };
}

export interface ChartBubbleProps extends ChartCommonProps {
  /** 气泡图数据 */
  data: BubbleDataItem[];
  /** 自定义颜色列表 */
  colorList?: echarts.Color[];
  /** 图表标题 */
  chartTitle?: string;
  /** 气泡标签字体大小 */
  fontSize?: number;
  /** 图表实例回调 */
  onChart?: (chart: echarts.EChartsType) => void;
  /** 点击事件 */
  onClick?: (event: echarts.ECElementEvent) => void;
}

const Bubble: React.FC<ChartBubbleProps> = (props) => {
  const {
    className,
    style,
    data,
    colorList = defaultBubbleColorList,
    chartTitle,
    fontSize: propFontSize,
    series,
    tooltip,
    title,
    onChart,
    onClick,
    ...coreOption
  } = props;
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const layoutVersion = "ring-layout-v6-ellipse-tight";
  const [containerSize, setContainerSize] = useState<{
    width: number;
    height: number;
  }>({
    width: 0,
    height: 0,
  });

  // 缓存位置计算结果
  const positionCacheRef = useRef<{
    cacheKey: string;
    positions: Array<{ x: number; y: number; radius: number }>;
  } | null>(null);

  // 生成缓存key，基于数据内容和容器尺寸
  const generateCacheKey = useCallback(
    (data: BubbleDataItem[], width: number, height: number): string => {
      // 基于数据的name和value生成key，确保数据变化时能检测到
      const dataKey = data
        ?.map((item) => `${item.name}:${item.value}`)
        .join("|");
      return `${layoutVersion}_${dataKey}_${width}_${height}`;
    },
    [layoutVersion]
  );

  // 仅用于布局的半径补偿：当大小差异过大时，给小球增加额外布局半径，避免被大球挤压
  const getLayoutRadiusList = useCallback((rawRadiusList: number[]): number[] => {
    if (!rawRadiusList.length) return rawRadiusList;

    const validRadiusList = rawRadiusList.filter(
      (radius) => Number.isFinite(radius) && radius > 0
    );
    if (!validRadiusList.length) return rawRadiusList;

    const maxRadius = Math.max(...validRadiusList);
    const minRadius = Math.min(...validRadiusList);
    if (minRadius <= 0) return rawRadiusList;

    const ratio = maxRadius / minRadius;
    if (ratio <= 3) return rawRadiusList;

    const radiusDiff = maxRadius - minRadius;
    const compensationBase = Math.min(
      maxRadius * 0.32,
      Math.max(4, radiusDiff * 0.24)
    );

    return rawRadiusList.map((radius) => {
      if (!Number.isFinite(radius) || radius <= 0) return radius;
      const normalized = radiusDiff === 0 ? 1 : (radius - minRadius) / radiusDiff;
      const weight = 1 - normalized;
      return radius + compensationBase * weight;
    });
  }, []);

  // 处理数据并生成图表配置
  const chartOption = useMemo(() => {
    // 容器尺寸未获取或数据为空时，返回空配置
    if (
      !data ||
      data.length === 0 ||
      containerSize.width === 0 ||
      containerSize.height === 0
    ) {
      return {} as ChartsOption;
    }

    const colorListLen = colorList.length;
    const countList: ExtendedBubbleDataItem[] = data?.map((item, index) => ({
      ...item,
      id: index,
    }));

    // 计算最大值
    let max = 0;
    countList?.forEach((e) => {
      if (e.value >= max) max = e.value;
    });

    // 获取容器尺寸
    const graphCanvas = containerSize;

    // 基础气泡大小，根据容器尺寸和数据数量动态调整
    const containerMin = Math.min(graphCanvas.width, graphCanvas.height);
    const containerArea = graphCanvas.width * graphCanvas.height;
    const dataCount = countList.length;

    // 根据数据数量和容器面积动态调整基础尺寸
    // 目标：尽量把气泡做大，让一层层外扩时紧贴容器边界；同时为环间隙留出必要空间。
    const areaPerBubble = containerArea / dataCount;
    const estimatedMaxRadius = Math.sqrt(areaPerBubble / Math.PI) * 0.82; // 提高密度系数，气泡更大

    // 数量越多，基础尺寸越小，避免重叠
    const sizeFactor = Math.max(0.55, 1.35 - dataCount * 0.07);
    const baseSize = Math.min(
      170 * sizeFactor,
      containerMin / (1.9 + dataCount * 0.08),
      estimatedMaxRadius * 2 // 确保不超过估算的最大半径
    );

    // 自适应非线性映射：压缩大值、抬升小值，数据差距仍可读但视觉更饱满
    const minPositiveValue = countList
      .map((item) => item.value)
      .filter((value) => value > 0)
      .reduce((min, value) => Math.min(min, value), Number.POSITIVE_INFINITY);
    const safeMinValue = Number.isFinite(minPositiveValue) ? minPositiveValue : 1;
    const valueRatio = max > 0 ? max / safeMinValue : 1;
    const compressPower =
      valueRatio > 20 ? 0.38 : valueRatio > 10 ? 0.46 : valueRatio > 4 ? 0.56 : 0.7;
    // 最小气泡的底线提高，避免最小那颗过小难以识别；仍保留与最大值的可见差距
    const minScale =
      valueRatio > 20 ? 0.74 : valueRatio > 10 ? 0.68 : valueRatio > 4 ? 0.62 : 0.56;
    const maxScale = 1.1;
    const symbolSizeList = countList.map((item) => {
      if (max <= 0) return baseSize * 0.6;
      const normalized = item.value > 0 ? item.value / max : 0;
      const compressed = Math.pow(normalized, compressPower);
      const scale = minScale + compressed * (maxScale - minScale);
      return Math.max(baseSize * 0.5, baseSize * scale);
    });

    const rawRadiusList = symbolSizeList.map((symbolSize) => symbolSize / 2);
    const layoutRadiusList = getLayoutRadiusList(rawRadiusList);

    // 生成缓存key
    const cacheKey = generateCacheKey(
      data,
      graphCanvas.width,
      graphCanvas.height
    );

    // 检查缓存，如果数据或容器尺寸没有变化，使用缓存的位置
    let randomCircleArr: Array<{ x: number; y: number; radius: number }>;
    if (
      positionCacheRef.current &&
      positionCacheRef.current.cacheKey === cacheKey &&
      positionCacheRef.current.positions.length === layoutRadiusList.length
    ) {
      // 使用缓存的位置
      randomCircleArr = positionCacheRef.current.positions;
    } else {
      // 重新计算位置
      randomCircleArr = drawCircles(
        layoutRadiusList,
        graphCanvas.width,
        graphCanvas.height
      );
      // 更新缓存
      positionCacheRef.current = {
        cacheKey,
        positions: randomCircleArr,
      };
    }

    // 处理每个数据项
    countList?.forEach((e, i) => {
      const symbolSize = symbolSizeList[i] ?? baseSize * 0.5;
      const fontSize = propFontSize ?? Math.max(12, Math.min(20, symbolSize * 0.28));

      // 先计算 symbolSize，因为 label 的 width 需要用到它
      let finalSymbolSize = symbolSize;
      if (randomCircleArr[i]) {
        e.x = randomCircleArr[i].x;
        e.y = randomCircleArr[i].y;
        e.symbolSize = symbolSize;
        finalSymbolSize = symbolSize;
      } else {
        // 兜底：放在容器中心
        e.symbolSize = symbolSize;
        e.x = graphCanvas.width / 2;
        e.y = graphCanvas.height / 2;
        finalSymbolSize = symbolSize;
      }

      e.label = {
        normal: {
          show: true,
          color: "#fff",
          fontSize,
          width: finalSymbolSize, // 设置宽度为气泡直径
          overflow: "truncate", // 超出部分截断
          ellipsis: "...", // 省略号
        },
      };

      e.emphasis = {
        label: {
          overflow: "none",
        },
      };

      e.itemStyle = {
        normal: {
          color: colorList[i % colorListLen], // 使用索引确保颜色一致性
        },
      };
    });

    const option: ChartsOption = {
      title: {
        text: chartTitle || "",
        ...title,
      },
      tooltip: {
        trigger: "item",
        formatter: function (
          params: echarts.TooltipComponentFormatterCallbackParams
        ) {
          if (
            params &&
            typeof params === "object" &&
            "data" in params &&
            params.data &&
            typeof params.data === "object" &&
            "name" in params.data
          ) {
            const data = params.data as ExtendedBubbleDataItem;
            return "<b>" + data.name + "</b>：<b>" + data.value + " </b>";
          }
          return "";
        },
        ...tooltip,
      },
      series: [
        {
          type: "graph",
          layout: "none",
          label: {
            show: true,
            normal: {
              color: "#fff",
            },
          },
          data: countList,
          ...series,
        } as ChartOptionType,
      ],
      ...coreOption,
    };

    return option;
  }, [
    data,
    colorList,
    chartTitle,
    propFontSize,
    title,
    tooltip,
    series,
    coreOption,
    containerSize,
    generateCacheKey,
    getLayoutRadiusList,
  ]);

  // 设置 ResizeObserver 监听容器尺寸变化（包括首次获取尺寸）
  useEffect(() => {
    if (!chartRef.current) return;

    const containerElement = chartRef.current.parentElement;
    if (!containerElement) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        setContainerSize((prev) => {
          if (prev.width !== width || prev.height !== height) {
            return { width, height };
          }
          return prev;
        });
      }
    });

    observer.observe(containerElement);
    resizeObserverRef.current = observer;

    return () => {
      observer.disconnect();
      resizeObserverRef.current = null;
    };
  }, []);

  // 处理图表 resize 的回调
  const handleResize = useCallback(() => {
    chartInstanceRef.current?.resize();
    // 重新设置配置以更新气泡位置
    if (chartInstanceRef.current && data && data.length > 0) {
      chartInstanceRef.current.setOption(chartOption as ChartOptionType, true);
    }
  }, [chartOption, data]);

  // 初始化图表
  useEffect(() => {
    if (!chartRef.current) return;
    // 等待容器尺寸有效后再初始化图表
    if (containerSize.width === 0 || containerSize.height === 0) return;

    // 初始化或获取已存在的实例
    let chart = chartInstanceRef.current;
    if (!chart) {
      chart = echarts.init(chartRef.current);
      chartInstanceRef.current = chart;
      // 首次初始化时调用 onChart 回调
      onChart?.(chart);
    }

    // 先 resize 确保 echarts 获取到正确的容器尺寸，再设置配置
    chart.resize();
    chart.setOption(chartOption as ChartOptionType, true);

    // 添加 window resize 监听
    window.addEventListener("resize", handleResize);

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
  }, [
    chartOption,
    containerSize.width,
    containerSize.height,
    handleResize,
    onChart,
    onClick,
  ]);

  // 组件卸载时清理图表实例
  useEffect(() => {
    return () => {
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

export default Bubble;
