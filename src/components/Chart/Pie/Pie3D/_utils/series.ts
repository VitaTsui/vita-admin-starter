import { getParametricEquation } from "./parametricEquation";
import type { Pie3DDataItem, SeriesItem } from "..";

export const calculateK = (internalDiameterRatio: number): number => {
  if (typeof internalDiameterRatio === "undefined") {
    return 1 / 3;
  }
  return internalDiameterRatio === 0
    ? 1
    : (1 - internalDiameterRatio) / (1 + internalDiameterRatio);
};

export const createSeries = (
  data: Pie3DDataItem[],
  k: number,
  minHeight: number,
  maxHeight: number,
  effectiveYOffset: number
): SeriesItem[] => {
  const series: SeriesItem[] = [];
  let sumValue = 0;
  let startValue = 0;
  let endValue = 0;

  for (let i = 0; i < data.length; i += 1) {
    sumValue += data[i].value;

    const seriesItem: SeriesItem = {
      name: data[i].name || `series${i}`,
      type: "surface",
      parametric: true,
      wireframe: {
        show: false,
      },
      pieData: { ...data[i] },
      pieStatus: {
        selected: false,
        hovered: false,
        k,
      },
    };

    if (data[i].itemStyle) {
      seriesItem.itemStyle = { ...data[i].itemStyle };
    }

    series.push(seriesItem);
  }

  const maxValue = data.length ? Math.max(...data.map((item) => item.value)) : 0;
  const safeMaxValue = maxValue > 0 ? maxValue : 1;

  for (let i = 0; i < series.length; i += 1) {
    endValue = startValue + series[i].pieData.value;
    series[i].pieData.startRatio = startValue / sumValue;
    series[i].pieData.endRatio = endValue / sumValue;

    const heightRatio = series[i].pieData.value / safeMaxValue;
    const height = minHeight + (maxHeight - minHeight) * heightRatio;

    series[i].parametricEquation = getParametricEquation(
      series[i].pieData.startRatio!,
      series[i].pieData.endRatio!,
      false,
      false,
      k,
      height,
      effectiveYOffset
    );
    startValue = endValue;
  }

  return series;
};
