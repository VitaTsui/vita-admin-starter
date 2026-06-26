import * as echarts from "echarts";
import { ChartCommonProps, ChartOptionType, ChartsOption } from "..";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import styles from "../index.module.less";

export interface RadarIndicator {
  name: string;
  max?: number;
}

/** 单指标 tooltip 触发方式
 * - `point`  仅悬停在数据点/线上触发（echarts 原生 item trigger）
 * - `region` 进入该指标的扇形区域即触发，并在命中扇形区内填充高亮色
 */
export type SingleIndicatorMode = "point" | "region";

export interface ChartRadarProps extends ChartCommonProps {
  indicators: RadarIndicator[];
  data: number[];
  color?: string;
  name?: string;
  /**
   * 单指标 tooltip：
   * - `true` 使用内置简单格式（`系列名 · 指标名：值`）
   * - 传函数则接收当前最近指标下标与原始 echarts params，自行返回 HTML
   */
  singleIndicatorTooltip?:
    | boolean
    | ((
        indicatorIndex: number,
        params: unknown,
        indicator: RadarIndicator,
      ) => string);
  /** 单指标触发方式；**不设置则完全走 echarts 原生全指标 tooltip**，忽略 `singleIndicatorTooltip` */
  singleIndicatorMode?: SingleIndicatorMode;
  /** `region` 模式下的高亮色；不传则使用 `color` 以 0.12 透明度渲染 */
  singleIndicatorHoverFill?: string;
}

const Radar: React.FC<ChartRadarProps> = (props) => {
  const {
    className,
    style,
    indicators,
    data,
    color = "#0364f5",
    name = "热力值",
    radar,
    series,
    singleIndicatorTooltip: singleIndicatorTooltipProp = false,
    singleIndicatorMode,
    singleIndicatorHoverFill,
    ...coreOption
  } = props;

  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const hoveredIndicatorRef = useRef<number>(-1);

  const singleIndicatorEnabled =
    Boolean(singleIndicatorTooltipProp) && singleIndicatorMode !== undefined;
  const singleIndicatorFormatter =
    typeof singleIndicatorTooltipProp === "function"
      ? singleIndicatorTooltipProp
      : undefined;
  const singleIndicatorRegion = singleIndicatorMode === "region";
  const singleIndicatorHighlight = singleIndicatorRegion;

  const chartOption = useMemo(() => {
    const tooltipOption =
      coreOption?.tooltip as echarts.TooltipComponentOption | undefined;

    const seriesOverride = series as echarts.RadarSeriesOption | undefined;
    const overrideData = seriesOverride?.data;
    const extraData = Array.isArray(overrideData) ? overrideData : [];

    // 将每个 extraData item 拆为独立 series，使图例可以分别控制显隐
    const extraSeries: echarts.RadarSeriesOption[] = extraData.map((item) => {
      const d = item as { name?: string; [key: string]: unknown };
      return {
        type: "radar",
        name: d.name ?? "",
        data: [d],
      };
    });

    const mainSeries: echarts.RadarSeriesOption = {
      type: "radar",
      name,
      data: [
        {
          value: data,
          name,
          areaStyle: { color, opacity: 0.3 },
          lineStyle: { color, width: 2 },
          itemStyle: { color: "#fff", borderColor: color, borderWidth: 2 },
          symbol: "circle",
          symbolSize: 6,
        },
      ],
    };

    const option: ChartsOption = {
      color: [color],
      radar: {
        indicator: indicators.map((ind) => ({
          name: ind.name,
          max: ind.max ?? 40,
        })),
        center: ["50%", "50%"],
        radius: "70%",
        splitNumber: 4,
        shape: "polygon",
        splitArea: {
          areaStyle: {
            color: ["rgba(3, 100, 245, 0.05)", "rgba(3, 100, 245, 0.1)"],
          },
        },
        axisLine: {
          lineStyle: {
            color: "rgba(3, 100, 245, 0.2)",
            type: "dashed",
          },
        },
        splitLine: {
          lineStyle: {
            color: "rgba(3, 100, 245, 0.2)",
            type: "dashed",
          },
        },
        axisLabel: {
          show: false,
        },
        axisName: {
          color: "#7B7B7B",
          fontSize: 14,
          fontWeight: 400,
        },
        ...radar,
      },
      series: [...extraSeries, mainSeries],
      ...coreOption,
      tooltip: {
        show: true,
        ...(singleIndicatorEnabled
          ? {
              trigger: "item" as const,
              ...(singleIndicatorRegion
                ? { triggerOn: "none" as const }
                : {}),
              formatter: (params: unknown) => {
                const idx = hoveredIndicatorRef.current;
                if (idx < 0 || idx >= indicators.length) return "";
                if (singleIndicatorFormatter) {
                  return singleIndicatorFormatter(idx, params, indicators[idx]);
                }
                const p = params as {
                  value?: number | number[];
                  data?: { value?: number | number[]; name?: string };
                  name?: string;
                  color?: string;
                };
                const rawValue = p?.data?.value ?? p?.value;
                const value = Array.isArray(rawValue) ? rawValue[idx] : rawValue;
                const seriesName = p?.data?.name ?? p?.name ?? "";
                const dot = `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p?.color ?? color};margin-right:6px;"></span>`;
                return `${dot}${seriesName ? seriesName + " · " : ""}${indicators[idx].name}：${value ?? "-"}`;
              },
            }
          : {}),
        ...(tooltipOption as object),
      },
    };

    return option;
  }, [
    indicators,
    data,
    color,
    name,
    radar,
    series,
    coreOption,
    singleIndicatorEnabled,
    singleIndicatorFormatter,
    singleIndicatorRegion,
  ]);

  const handleResize = useCallback(() => {
    chartInstanceRef.current?.resize();
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;

    let chart = chartInstanceRef.current;
    if (!chart) {
      chart = echarts.init(chartRef.current);
      chartInstanceRef.current = chart;
    }

    chart.setOption(chartOption as ChartOptionType, true);

    let zrMoveHandler:
      | ((e: { offsetX: number; offsetY: number }) => void)
      | null = null;
    let zrOutHandler: (() => void) | null = null;
    type PolygonLike = {
      attr: (opts: Record<string, unknown>) => void;
    };
    type PolygonCtor = new (opts: Record<string, unknown>) => PolygonLike;
    let hoverShape: PolygonLike | null = null;
    if (singleIndicatorEnabled) {
      const zr = chart.getZr();
      const mainSeriesIndex =
        (chartOption.series as unknown[] | undefined)?.length != null
          ? (chartOption.series as unknown[]).length - 1
          : 0;
      const hoverFill = singleIndicatorHoverFill ?? color;
      if (singleIndicatorHighlight) {
        const Polygon = (
          echarts as unknown as { graphic: { Polygon: PolygonCtor } }
        ).graphic.Polygon;
        hoverShape = new Polygon({
          shape: { points: [] },
          style: { fill: hoverFill, opacity: 0.12 },
          silent: true,
          z: 0,
          invisible: true,
        });
        (zr as unknown as { add: (el: PolygonLike) => void }).add(hoverShape);
      }
      const hideTip = () => {
        hoveredIndicatorRef.current = -1;
        if (singleIndicatorRegion) {
          chartInstanceRef.current?.dispatchAction({ type: "hideTip" });
        }
        if (hoverShape) hoverShape.attr({ invisible: true });
      };
      zrMoveHandler = (e) => {
        const model = (
          chart as unknown as {
            getModel: () => {
              getComponent: (t: string) => {
                coordinateSystem?: {
                  cx: number;
                  cy: number;
                  r?: number;
                  getIndicatorAxes: () => { angle: number }[];
                };
              } | null;
            };
          }
        ).getModel();
        const coord = model.getComponent("radar")?.coordinateSystem;
        if (!coord) return;
        const dx = e.offsetX - coord.cx;
        const dy = e.offsetY - coord.cy;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const outerR = coord.r ?? Infinity;
        if (distance > outerR) {
          hideTip();
          return;
        }
        const axes = coord.getIndicatorAxes();
        // echarts 雷达轴角度按数学约定（y 向上），而屏幕坐标 y 向下，需翻转 y
        const mouseAngle = Math.atan2(-dy, dx);
        let bestI = -1;
        let bestDA = Infinity;
        axes.forEach((ax, i) => {
          let da = Math.abs(mouseAngle - ax.angle);
          if (da > Math.PI) da = 2 * Math.PI - da;
          if (da < bestDA) {
            bestDA = da;
            bestI = i;
          }
        });
        hoveredIndicatorRef.current = bestI;
        if (hoverShape && bestI >= 0) {
          // 以与雷达多边形一致的边界构造扇形区：
          // 中心 → 与上一轴顶边的中点 → 当前轴顶 → 与下一轴顶边的中点
          const n = axes.length;
          const tipOf = (idx: number) => {
            const a = axes[idx].angle;
            return [
              coord.cx + outerR * Math.cos(a),
              coord.cy - outerR * Math.sin(a),
            ] as [number, number];
          };
          const midOf = (a: [number, number], b: [number, number]) =>
            [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] as [number, number];
          const prevTip = tipOf((bestI - 1 + n) % n);
          const curTip = tipOf(bestI);
          const nextTip = tipOf((bestI + 1) % n);
          const points = [
            [coord.cx, coord.cy],
            midOf(prevTip, curTip),
            curTip,
            midOf(curTip, nextTip),
          ];
          hoverShape.attr({ shape: { points }, invisible: false });
        }
        if (singleIndicatorRegion) {
          chartInstanceRef.current?.dispatchAction({
            type: "showTip",
            seriesIndex: mainSeriesIndex,
            dataIndex: 0,
            position: [e.offsetX, e.offsetY],
          });
        }
      };
      zrOutHandler = () => hideTip();
      zr.on("mousemove", zrMoveHandler);
      zr.on("globalout", zrOutHandler);
    }

    window.addEventListener("resize", handleResize);

    if (chartRef.current && !resizeObserverRef.current) {
      resizeObserverRef.current = new ResizeObserver(handleResize);
      resizeObserverRef.current.observe(chartRef.current);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartInstanceRef.current) {
        const zr = chartInstanceRef.current.getZr();
        if (zrMoveHandler) zr.off("mousemove", zrMoveHandler);
        if (zrOutHandler) zr.off("globalout", zrOutHandler);
        if (hoverShape) {
          (zr as unknown as { remove: (el: PolygonLike) => void }).remove(
            hoverShape,
          );
        }
      }
    };
  }, [
    chartOption,
    handleResize,
    singleIndicatorEnabled,
    singleIndicatorRegion,
    singleIndicatorHighlight,
    singleIndicatorHoverFill,
    color,
  ]);

  useEffect(() => {
    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
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

export default Radar;
