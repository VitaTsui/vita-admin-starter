import type { SeriesItem, LabelConfig } from "..";

interface LabelLine {
  coords: number[][];
  name: string;
  color?: string;
}

interface LabelPoint {
  x: number;
  y: number;
  z: number;
  text: string;
  name: string;
  color: string;
  originalY?: number; // 原始y坐标，用于调整
}

interface LabelRect {
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
}

// 估算标签的宽度和高度（基于文本长度和字体大小）
const estimateLabelSize = (
  text: string,
  fontSize: number = 14,
  padding: number = 5
): { width: number; height: number } => {
  // 简单估算：每个字符约占用 fontSize * 0.6 的宽度
  const estimatedWidth = text.length * fontSize * 0.6 + padding * 2;
  const estimatedHeight = fontSize + padding * 2;
  return { width: estimatedWidth, height: estimatedHeight };
};

// 检测两个矩形是否重叠
const isOverlapping = (rect1: LabelRect, rect2: LabelRect): boolean => {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
};

// 调整标签位置以避免重叠
const adjustLabelPositions = (
  labelPoints: LabelPoint[],
  labelTextStyle: { fontSize?: number; padding?: number }
): LabelPoint[] => {
  const fontSize = labelTextStyle.fontSize || 14;
  const padding = Array.isArray(labelTextStyle.padding)
    ? labelTextStyle.padding[0] || 5
    : labelTextStyle.padding || 5;

  // 将标签尺寸转换为3D坐标系的单位
  // 假设字体大小和padding的单位需要转换为3D坐标系的相对单位
  // 3D坐标系的范围大约是-1到1，所以需要适当的缩放
  const scaleFactor = 0.01; // 将像素单位转换为3D坐标单位

  // 创建标签矩形数组（在2D投影平面上，使用x和y坐标）
  const labelRects: LabelRect[] = labelPoints?.map((point) => {
    const size = estimateLabelSize(point.text, fontSize, padding);
    // 将像素尺寸转换为3D坐标单位
    const width3D = size.width * scaleFactor;
    const height3D = size.height * scaleFactor;
    return {
      x: point.x - width3D / 2,
      y: point.y - height3D / 2,
      width: width3D,
      height: height3D,
      index: 0, // 将在循环中设置
    };
  });

  // 设置索引
  labelRects?.forEach((rect, index) => {
    rect.index = index;
  });

  // 保存原始坐标
  labelPoints?.forEach((point) => {
    point.originalY = point.y;
  });

  // 检测并调整重叠的标签
  const minSpacing = fontSize * scaleFactor * 0.3; // 最小间距（3D坐标单位）
  let hasOverlap = true;
  let iterations = 0;
  const maxIterations = 100; // 最大迭代次数

  while (hasOverlap && iterations < maxIterations) {
    hasOverlap = false;
    iterations++;

    for (let i = 0; i < labelRects.length; i++) {
      for (let j = i + 1; j < labelRects.length; j++) {
        if (isOverlapping(labelRects[i], labelRects[j])) {
          hasOverlap = true;

          // 计算两个标签的中心点
          const center1X = labelRects[i].x + labelRects[i].width / 2;
          const center1Y = labelRects[i].y + labelRects[i].height / 2;
          const center2X = labelRects[j].x + labelRects[j].width / 2;
          const center2Y = labelRects[j].y + labelRects[j].height / 2;

          // 计算x和y方向的距离
          const distanceX = Math.abs(center1X - center2X);
          const distanceY = Math.abs(center1Y - center2Y);

          // 计算需要的距离
          const requiredDistanceX =
            (labelRects[i].width + labelRects[j].width) / 2 + minSpacing;
          const requiredDistanceY =
            (labelRects[i].height + labelRects[j].height) / 2 + minSpacing;

          // 根据重叠情况调整位置
          const originalY1 = labelPoints[i].originalY || labelPoints[i].y;
          const originalY2 = labelPoints[j].originalY || labelPoints[j].y;
          const originalX1 = labelPoints[i].x;
          const originalX2 = labelPoints[j].x;

          // 优先调整y方向（垂直方向），因为这是最常见的重叠情况
          if (distanceY < requiredDistanceY) {
            const adjustmentY =
              (requiredDistanceY - distanceY) / 2 + minSpacing * 0.5;

            if (originalY1 < originalY2) {
              labelPoints[i].y -= adjustmentY;
              labelPoints[j].y += adjustmentY;
            } else {
              labelPoints[i].y += adjustmentY;
              labelPoints[j].y -= adjustmentY;
            }
          }

          // 如果x方向也很接近，稍微调整x方向
          if (distanceX < requiredDistanceX * 0.9) {
            const adjustmentX = ((requiredDistanceX - distanceX) / 2) * 0.5;

            if (originalX1 < originalX2) {
              labelPoints[i].x -= adjustmentX;
              labelPoints[j].x += adjustmentX;
            } else {
              labelPoints[i].x += adjustmentX;
              labelPoints[j].x -= adjustmentX;
            }
          }

          // 更新矩形位置
          const size1 = estimateLabelSize(
            labelPoints[i].text,
            fontSize,
            padding
          );
          const size2 = estimateLabelSize(
            labelPoints[j].text,
            fontSize,
            padding
          );
          labelRects[i].x = labelPoints[i].x - (size1.width * scaleFactor) / 2;
          labelRects[i].y = labelPoints[i].y - (size1.height * scaleFactor) / 2;
          labelRects[j].x = labelPoints[j].x - (size2.width * scaleFactor) / 2;
          labelRects[j].y = labelPoints[j].y - (size2.height * scaleFactor) / 2;
        }
      }
    }
  }

  return labelPoints;
};

const calculateLabelPoints = (
  series: SeriesItem[],
  label: LabelConfig,
  maxValue: number,
  minHeight: number,
  maxHeight: number,
  autoRotate: boolean,
  yOffset: number,
  alpha: number,
  colorPalette: string[]
): { lines: LabelLine[]; points: LabelPoint[] } => {
  const labelLines: LabelLine[] = [];
  const labelPoints: LabelPoint[] = [];
  const effectiveYOffset = autoRotate ? 0 : yOffset;
  const sumValue = series.reduce((sum, s) => sum + s.pieData.value, 0);

  for (let i = 0; i < series.length; i += 1) {
    const midRatio =
      (series[i].pieData.startRatio! + series[i].pieData.endRatio!) / 2;
    const midRadian = midRatio * Math.PI * 2;

    const heightRatio = series[i].pieData.value / maxValue;
    const height = minHeight + (maxHeight - minHeight) * heightRatio;
    const zTop = height * 0.1;
    const zBottom = -height * 0.1;

    const startRadius = 1;
    const startY = Math.sin(midRadian) * startRadius + effectiveYOffset;

    let startZ: number;
    let midHeightIncrease: number;
    let midPoint: number[];
    let endPoint: number[];

    if (autoRotate) {
      startZ = zTop;
      midHeightIncrease = 1;
      const midDistance = label.distance || 1;
      midPoint = [
        Math.cos(midRadian) * (startRadius + midDistance * 0.2),
        Math.sin(midRadian) * (startRadius + midDistance * 0.2),
        startZ + midHeightIncrease,
      ];
      const horizontalDistance = midDistance * 0.4;
      endPoint = [
        Math.cos(midRadian) *
          (startRadius + midDistance * 0.2 + horizontalDistance),
        Math.sin(midRadian) *
          (startRadius + midDistance * 0.2 + horizontalDistance),
        midPoint[2],
      ];
    } else {
      const threshold = -1 + alpha / 90;
      const isFrontSide = startY < threshold;

      if (isFrontSide) {
        startZ = (zTop + zBottom) / 2;
        midHeightIncrease = -1;
      } else {
        startZ = zTop;
        midHeightIncrease = 1;
      }

      const midDistance = 1;
      midPoint = [
        Math.cos(midRadian) * (startRadius + midDistance * 0.1),
        Math.sin(midRadian) * (startRadius + midDistance * 0.5) +
          effectiveYOffset,
        startZ + midHeightIncrease,
      ];

      const isLeftSide = Math.cos(midRadian) < 0;
      const horizontalDistance = midDistance * 0.6;
      endPoint = [
        midPoint[0] + (isLeftSide ? -horizontalDistance : horizontalDistance),
        midPoint[1],
        midPoint[2],
      ];
    }

    const startPoint = [Math.cos(midRadian) * startRadius, startY, startZ];

    const sectorColor =
      series[i].itemStyle?.color ||
      series[i].pieData.itemStyle?.color ||
      colorPalette[i % colorPalette.length];

    labelLines.push({
      coords: [startPoint, midPoint, endPoint],
      name: series[i].name,
      color: sectorColor,
    });

    const percent = ((series[i].pieData.value / sumValue) * 100).toFixed(1);
    let labelText = "";
    if (label.formatter) {
      labelText = label.formatter({
        name: series[i].name,
        value: series[i].pieData.value,
        percent: parseFloat(percent),
      });
    } else {
      labelText = `${series[i].name} ${percent}%`;
    }

    labelPoints.push({
      x: endPoint[0],
      y: endPoint[1],
      z: endPoint[2],
      text: labelText,
      name: series[i].name,
      color: sectorColor,
    });
  }

  // 调整标签位置以避免重叠
  const labelTextStyle = label.textStyle || {};
  // 处理 padding 可能是数组的情况
  const adjustedTextStyle = {
    fontSize: labelTextStyle.fontSize,
    padding: Array.isArray(labelTextStyle.padding)
      ? labelTextStyle.padding[0] || 5
      : labelTextStyle.padding || 5,
  };
  const adjustedPoints = adjustLabelPositions(labelPoints, adjustedTextStyle);

  // 更新标签线的终点和中间点位置以匹配调整后的标签位置
  adjustedPoints?.forEach((point, index) => {
    if (labelLines[index]) {
      const originalEndPoint = labelLines[index].coords[2];
      const originalMidPoint = labelLines[index].coords[1];

      // 更新终点
      labelLines[index].coords[2] = [point.x, point.y, point.z];

      // 如果y坐标发生了变化，调整中间点的y坐标以保持线条平滑
      const yDiff = point.y - originalEndPoint[1];
      if (Math.abs(yDiff) > 0.001) {
        // 调整中间点的y坐标，使其在起点和终点之间平滑过渡
        const midY = originalMidPoint[1] + yDiff * 0.5; // 中间点跟随终点移动，但幅度较小
        labelLines[index].coords[1] = [
          originalMidPoint[0],
          midY,
          originalMidPoint[2],
        ];
      }
    }
  });

  return { lines: labelLines, points: adjustedPoints };
};

export const createLabelSeries = (
  series: SeriesItem[],
  label: LabelConfig,
  maxValue: number,
  minHeight: number,
  maxHeight: number,
  autoRotate: boolean,
  yOffset: number,
  alpha: number,
  colorPalette: string[]
): SeriesItem[] => {
  if (!label?.show) {
    return [];
  }

  const { lines, points } = calculateLabelPoints(
    series,
    label,
    maxValue,
    minHeight,
    maxHeight,
    autoRotate,
    yOffset,
    alpha,
    colorPalette
  );

  const labelSeries: SeriesItem[] = [];
  const labelTextStyle = label.textStyle || {};

  lines?.forEach((line) => {
    labelSeries.push({
      type: "line3D",
      coordinateSystem: "cartesian3D",
      data: line.coords,
      lineStyle: {
        width: label.hideLine ? 0 : label.lineStyle?.width || 1,
        color: label.lineStyle?.color || line.color || "#fff",
      },
      silent: true,
    } as unknown as SeriesItem);
  });

  points?.forEach((point) => {
    labelSeries.push({
      type: "scatter3D",
      data: [[point.x, point.y, point.z, point.text, point.name]],
      symbolSize: 0,
      label: {
        show: true,
        position: "top",
        formatter: (params: unknown) => {
          const dataArray = (params as { value: unknown[] })?.value || [];
          return (dataArray?.[3] as string) || "";
        },
        textStyle: {
          color: labelTextStyle.color || point.color || "#fff",
          fontSize: labelTextStyle.fontSize || 14,
          padding: labelTextStyle.padding || 5,
        },
      },
      silent: true,
    } as unknown as SeriesItem);
  });

  return labelSeries;
};
