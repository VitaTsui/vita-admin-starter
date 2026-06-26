import * as echarts from "echarts";

export interface AutoScrollByItemProps {
  chart: echarts.ECharts;
  xAxisData?: Array<string>;
  windowSize?: number;
  interval?: number;
  startIndex?: number;
  autoPlay?: boolean;
  enableWheelScroll?: boolean;
}

export function autoScrollByItem(props: AutoScrollByItemProps) {
  const {
    chart,
    xAxisData,
    windowSize = 10,
    interval = 2000,
    startIndex = 0,
    autoPlay = true,
    enableWheelScroll = true,
  } = props;
  const total = xAxisData?.length ?? 0;
  if (total <= 0) {
    return {
      pause: () => {},
      resume: () => {},
      dispose: () => {},
    };
  }

  const initialStartIndex = Math.max(
    0,
    Math.min(startIndex, Math.max(total - 1, 0)),
  );
  const stepPercent = total > 0 ? (1 / total) * 100 : 0;
  const windowSizePercent = total > 0 ? (windowSize / total) * 100 : 100;
  const initialStartPercent = total > 0 ? (initialStartIndex / total) * 100 : 0;
  let start = initialStartPercent;
  let end = Math.min(initialStartPercent + windowSizePercent, 100);

  const syncDataZoomRange = () => {
    const option = chart.getOption() as {
      dataZoom?: Array<Record<string, unknown>>;
    };
    const currentDataZoom = option?.dataZoom;
    if (!currentDataZoom?.length) return;
    chart.setOption({
      dataZoom: currentDataZoom.map((dz) => ({
        ...dz,
        start,
        end,
      })),
    });
  };

  syncDataZoomRange();

  let timer: NodeJS.Timeout | null = null;
  if (autoPlay) {
    timer = setInterval(tick, interval);
  }

  function tick() {
    start += stepPercent;
    end += stepPercent;

    if (end > 100) {
      start = 0;
      end = windowSizePercent;
    }

    syncDataZoomRange();
  }

  if (autoPlay) {
    chart.getZr().on("mouseover", pause);
    chart.getZr().on("mouseout", resume);
  }

  function pause() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }
  function resume() {
    if (autoPlay && !timer) {
      timer = setInterval(tick, interval);
    }
  }

  const chartDom = chart.getDom();
  const applyWheelDelta = (delta: number) => {
    if (delta === 0) return;
    const direction = delta > 0 ? 1 : -1;

    start += direction * stepPercent;
    end += direction * stepPercent;

    if (start < 0) {
      start = 0;
      end = windowSizePercent;
    }
    if (end > 100) {
      end = 100;
      start = Math.max(0, 100 - windowSizePercent);
    }

    syncDataZoomRange();
  };

  function handleWheel(event: Event) {
    if (!enableWheelScroll) return;
    const wheelEvent = event as WheelEvent;
    wheelEvent.preventDefault();
    applyWheelDelta(wheelEvent.deltaY);
  }

  function handleZrMouseWheel(params: unknown) {
    if (!enableWheelScroll) return;
    const eventLike = (params as { event?: Record<string, unknown> })?.event;
    const nativeEvent = eventLike?.event as WheelEvent | undefined;
    const deltaFromNative = nativeEvent?.deltaY;
    const deltaFromEventLike =
      (eventLike?.deltaY as number | undefined) ??
      (eventLike?.zrDelta as number | undefined);
    const wheelDelta = eventLike?.wheelDelta as number | undefined;
    const resolvedDelta =
      deltaFromNative ??
      deltaFromEventLike ??
      (typeof wheelDelta === "number" ? -wheelDelta : undefined);

    if (typeof resolvedDelta !== "number") return;
    nativeEvent?.preventDefault();
    applyWheelDelta(resolvedDelta);
  }

  if (enableWheelScroll) {
    chartDom.addEventListener("wheel", handleWheel, { passive: false });
    chart.getZr().on("mousewheel", handleZrMouseWheel);
  }

  const handleWindowResize = () => {
    chart.resize();
    syncDataZoomRange();
  };
  window.addEventListener("resize", handleWindowResize);

  function dispose() {
    pause();
    if (autoPlay) {
      chart.getZr().off("mouseover", pause);
      chart.getZr().off("mouseout", resume);
    }
    if (enableWheelScroll) {
      chartDom.removeEventListener("wheel", handleWheel);
      chart.getZr().off("mousewheel", handleZrMouseWheel);
    }
    window.removeEventListener("resize", handleWindowResize);
  }

  return { pause, resume, dispose };
}
