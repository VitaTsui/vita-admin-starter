import { IGroup, ModelConfig, ShapeOptions, ShapeStyle } from "@antv/g6";

interface ArrowEdgeProps {
  styles?: ShapeStyle;
}

export default function ArrowEdge(
  arrowEdgeProps: ArrowEdgeProps
): ShapeOptions {
  const { styles } = arrowEdgeProps || {};

  const _styles: ShapeStyle = {
    stroke: "#A5A5A5",
    lineWidth: 1.5,
    ...styles,
  };

  const draw = (cfg: ModelConfig, group: IGroup) => {
    const { startPoint, endPoint } = cfg;
    if (!startPoint || !endPoint) {
      return group.addShape("path", {
        attrs: {
          path: [],
          stroke: "#000",
          lineWidth: 1,
        },
        name: "empty-path",
      });
    }
    const line = group.addShape("path", {
      attrs: {
        path: [
          // 起始点
          ["M", startPoint.x, startPoint.y],
          // 水平向右到中间X位置
          ["L", (startPoint.x + endPoint.x) / 2, startPoint.y],
          // 垂直向下/上到终点Y位置
          ["L", (startPoint.x + endPoint.x) / 2, endPoint.y],
          // 水平向右到终点
          ["L", endPoint.x, endPoint.y],
        ],
        endArrow: {
          path: "M 0,0 L 6,3 L 6,-3 Z",
          fill: "#A5A5A5",
          d: 0,
        },
        ..._styles,
      },
      name: "path-shape",
    });
    return line;
  };

  return {
    draw,
  };
}
