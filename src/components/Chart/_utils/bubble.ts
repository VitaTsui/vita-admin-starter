import * as echarts from "echarts";

export const defaultBubbleColorList: echarts.Color[] = [
  "#5470C6",
  "#91CC75",
  "#FAC858",
  "#EE6666",
  "#73C0DE",
  "#3BA272",
  "#FC8452",
  "#9A60B4",
  "#EA7CCC",
];

export function calculateBubbleRadius(
  value: number,
  maxValue: number,
  baseSize: number,
): number {
  const number = Math.round(maxValue * 0.5);
  const symbolSize = ((value + number) / maxValue) * baseSize;
  return symbolSize / 2;
}

type Circle = { x: number; y: number; radius: number };

function isOverlapping(circle1: Circle, circle2: Circle, minGap: number): boolean {
  const distance = Math.hypot(circle1.x - circle2.x, circle1.y - circle2.y);
  return distance < circle1.radius + circle2.radius + minGap;
}

function checkOverlapWithAll(
  circle: Circle,
  existingCircles: Array<Circle | undefined>,
  minGap: number,
): boolean {
  for (const existing of existingCircles) {
    if (!existing) continue;
    if (isOverlapping(circle, existing, minGap)) return true;
  }
  return false;
}

function getOverlapPenalty(
  circle: Circle,
  existingCircles: Array<Circle | undefined>,
  minGap: number,
): number {
  let penalty = 0;
  for (const other of existingCircles) {
    if (!other) continue;
    const distance = Math.hypot(circle.x - other.x, circle.y - other.y);
    const minDistance = circle.radius + other.radius + minGap;
    if (distance < minDistance) {
      penalty += minDistance - distance;
    }
  }
  return penalty;
}

export function drawCircles(
  radiusList: number[],
  maxX: number,
  maxY: number,
): Array<{ x: number; y: number; radius: number }> {
  if (!radiusList.length) return [];

  const circles: Array<Circle | undefined> = [];
  const sortedIndices = radiusList
    .map((radius, index) => ({ radius, index }))
    .sort((a, b) => b.radius - a.radius)
    .map((item) => item.index);

  const centerX = maxX / 2;
  const centerY = maxY / 2;
  const minCanvas = Math.min(maxX, maxY);
  const EDGE_PADDING = Math.max(8, Math.min(20, minCanvas * 0.06));
  const avgRadius = radiusList.reduce((sum, radius) => sum + radius, 0) / radiusList.length;
  const MIN_GAP = Math.max(1.5, avgRadius * 0.08);
  const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

  // 按容器长宽比例将同心圆扩展为同心椭圆（面积守恒：aspectX * aspectY = 1）：
  // - 容器正方形时 aspectX = aspectY = 1（标准圆形环）
  // - 容器越扁平，长边方向被适度拉伸、短边方向被对应压缩，
  //   使层层外扩既贴合区域比例，又不会让边缘气泡飞离中心，保持"同心紧凑"观感。
  const aspectRatio = maxY > 0 ? maxX / maxY : 1;
  const aspectX = Math.sqrt(aspectRatio);
  const aspectY = 1 / aspectX;

  const ellipsePerimeter = (rx: number, ry: number): number => {
    if (rx <= 0 && ry <= 0) return 0;
    const h = Math.pow(rx - ry, 2) / Math.max(1e-6, Math.pow(rx + ry, 2));
    return Math.PI * (rx + ry) * (1 + (3 * h) / (10 + Math.sqrt(Math.max(0, 4 - 3 * h))));
  };

  for (let orderIndex = 0; orderIndex < sortedIndices.length; orderIndex++) {
    const originalIndex = sortedIndices[orderIndex];
    const radius = radiusList[originalIndex];

    const minX = radius + EDGE_PADDING;
    const maxInnerX = maxX - radius - EDGE_PADDING;
    const minY = radius + EDGE_PADDING;
    const maxInnerY = maxY - radius - EDGE_PADDING;

    if (minX >= maxInnerX || minY >= maxInnerY) {
      circles[originalIndex] = { x: centerX, y: centerY, radius };
      continue;
    }

    // 同心椭圆的"单位环半径"上限：需同时保证在 x、y 两个方向上不越界
    const maxRingUnitX =
      aspectX > 0 ? Math.min(maxInnerX - centerX, centerX - minX) / aspectX : 0;
    const maxRingUnitY =
      aspectY > 0 ? Math.min(maxInnerY - centerY, centerY - minY) / aspectY : 0;
    const maxSearchRadius = Math.max(0, Math.min(maxRingUnitX, maxRingUnitY));

    let placed = false;

    // First bubble at center to ensure center-out expansion.
    if (orderIndex === 0) {
      const first = {
        x: Math.max(minX, Math.min(maxInnerX, centerX)),
        y: Math.max(minY, Math.min(maxInnerY, centerY)),
        radius,
      };
      circles[originalIndex] = first;
      continue;
    }

    // 1) Deterministic concentric rings.
    // 环间距要同时满足：
    // - 与最大气泡（位于中心）不重叠：centerRadius + radius + gap
    // - 标准六边形紧致堆叠：2 * avgRadius + gap
    const centerRadius = radiusList[sortedIndices[0]] ?? avgRadius;
    const ringSpacing = Math.max(
      centerRadius + radius + MIN_GAP,
      avgRadius * 2 + MIN_GAP,
      8,
    );
    for (
      let ring = 1;
      ring * ringSpacing <= maxSearchRadius && !placed;
      ring++
    ) {
      const ringRadius = ring * ringSpacing;
      const ringRadiusX = ringRadius * aspectX;
      const ringRadiusY = ringRadius * aspectY;
      const circumference = Math.max(1, ellipsePerimeter(ringRadiusX, ringRadiusY));
      const slots = Math.max(
        8,
        Math.round(circumference / Math.max(radius * 2 + MIN_GAP, 10)),
      );
      const angleOffset = orderIndex * GOLDEN_ANGLE * 0.55 + ring * 0.25;

      for (let slot = 0; slot < slots && !placed; slot++) {
        const angle = angleOffset + (slot / slots) * Math.PI * 2;
        const candidate: Circle = {
          x: centerX + Math.cos(angle) * ringRadiusX,
          y: centerY + Math.sin(angle) * ringRadiusY,
          radius,
        };
        if (
          candidate.x >= minX &&
          candidate.x <= maxInnerX &&
          candidate.y >= minY &&
          candidate.y <= maxInnerY &&
          !checkOverlapWithAll(candidate, circles, MIN_GAP)
        ) {
          circles[originalIndex] = candidate;
          placed = true;
        }
      }
    }

    // 2) Center-out spiral fallback.
    if (!placed) {
      const spiralStep = Math.max(3, (avgRadius + radius + MIN_GAP) * 0.34);
      const maxSteps = 1600;

      for (let step = 1; step <= maxSteps && !placed; step++) {
        const ringRadius = spiralStep * Math.sqrt(step);
        if (ringRadius > maxSearchRadius) break;

        const angle = step * GOLDEN_ANGLE + orderIndex * 0.31;
        const candidate: Circle = {
          x: centerX + Math.cos(angle) * ringRadius * aspectX,
          y: centerY + Math.sin(angle) * ringRadius * aspectY,
          radius,
        };
        if (
          candidate.x >= minX &&
          candidate.x <= maxInnerX &&
          candidate.y >= minY &&
          candidate.y <= maxInnerY &&
          !checkOverlapWithAll(candidate, circles, MIN_GAP)
        ) {
          circles[originalIndex] = candidate;
          placed = true;
        }
      }
    }

    // 3) Last resort: choose the least-overlap point on rings (keeps center-out trend).
    if (!placed) {
      let best: Circle | null = null;
      let bestPenalty = Number.POSITIVE_INFINITY;

      const levels = 40;
      for (let level = 1; level <= levels; level++) {
        const ringRadius = (maxSearchRadius * level) / levels;
        const ringRadiusX = ringRadius * aspectX;
        const ringRadiusY = ringRadius * aspectY;
        const slots = Math.max(
          12,
          Math.round(
            ellipsePerimeter(ringRadiusX, ringRadiusY) / Math.max(radius + MIN_GAP, 8),
          ),
        );
        const angleOffset = level * 0.21 + orderIndex * 0.17;

        for (let slot = 0; slot < slots; slot++) {
          const angle = angleOffset + (slot / slots) * Math.PI * 2;
          const candidate: Circle = {
            x: centerX + Math.cos(angle) * ringRadiusX,
            y: centerY + Math.sin(angle) * ringRadiusY,
            radius,
          };
          if (
            candidate.x < minX ||
            candidate.x > maxInnerX ||
            candidate.y < minY ||
            candidate.y > maxInnerY
          ) {
            continue;
          }

          const penalty = getOverlapPenalty(candidate, circles, MIN_GAP);
          if (penalty < bestPenalty) {
            bestPenalty = penalty;
            best = candidate;
            if (penalty === 0) break;
          }
        }
        if (bestPenalty === 0) break;
      }

      circles[originalIndex] = best ?? {
        x: Math.max(minX, Math.min(maxInnerX, centerX)),
        y: Math.max(minY, Math.min(maxInnerY, centerY)),
        radius,
      };
    }
  }

  return circles.map((circle, index) => {
    if (circle) return circle;
    const radius = radiusList[index];
    return { x: centerX, y: centerY, radius };
  });
}
