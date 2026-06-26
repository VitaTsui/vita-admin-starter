import * as echarts from "echarts";
import zrender from "zrender";

import { ChartOptionType, Series } from "..";

const colors: string[] = ["rgba(29, 230, 235,1)", "rgba(7, 235, 251,1)"];

// 绘制正面
const CubeFront: zrender.graphic.Path = echarts.graphic.extendShape({
  shape: {
    x: 0,
    y: 0,
  },
  buildPath(ctx, shape) {
    const { xAxisPoint, xAxisTranslation = 0, barWidth = 20 } = shape;

    // 右上点
    const c0 = [shape.x + 0 + xAxisTranslation, shape.y];
    // 左上点
    const c1 = [shape.x - barWidth + xAxisTranslation, shape.y];
    // 左下点
    const c2 = [xAxisPoint[0] - barWidth + xAxisTranslation, xAxisPoint[1]];
    // 右下点
    const c3 = [xAxisPoint[0] + 0 + xAxisTranslation, xAxisPoint[1]];

    ctx
      .moveTo(c0[0], c0[1])
      .lineTo(c1[0], c1[1])
      .lineTo(c2[0], c2[1])
      .lineTo(c3[0], c3[1])
      .closePath();
  },
});
// 绘制右侧面
const CubeRight: zrender.graphic.Path = echarts.graphic.extendShape({
  shape: {
    x: 0,
    y: 0,
  },
  buildPath(ctx, shape) {
    const { xAxisPoint, xAxisTranslation = 0, barWidth = 20 } = shape;
    // 根据 barWidth 计算深度偏移，保持原有比例
    const depthOffset = (barWidth * 8) / 20;

    // 左上点
    const c1 = [shape.x + 0 + xAxisTranslation, shape.y];
    // 左下点
    const c2 = [xAxisPoint[0] + 0 + xAxisTranslation, xAxisPoint[1]];
    // 右下点
    const c3 = [
      xAxisPoint[0] + depthOffset + xAxisTranslation,
      xAxisPoint[1] - 5,
    ];
    // 右上点
    const c4 = [shape.x + depthOffset + xAxisTranslation, shape.y - 5];

    ctx
      .moveTo(c1[0], c1[1])
      .lineTo(c2[0], c2[1])
      .lineTo(c3[0], c3[1])
      .lineTo(c4[0], c4[1])
      .closePath();
  },
});
// 绘制顶面
const CubeTop: zrender.graphic.Path = echarts.graphic.extendShape({
  shape: {
    x: 0,
    y: 0,
  },
  buildPath(ctx, shape) {
    const { xAxisTranslation = 0, barWidth = 20 } = shape;
    // 根据 barWidth 计算偏移量，保持原有比例
    const rightOffset = (barWidth * 8) / 20; // 右侧偏移
    const leftOffset = (barWidth * 12) / 20; // 左侧偏移

    // 右上点
    const c1 = [shape.x + 0 + xAxisTranslation, shape.y];
    // 右上点
    const c2 = [shape.x + rightOffset + xAxisTranslation, shape.y - 5];
    // 左上点
    const c3 = [shape.x - leftOffset + xAxisTranslation, shape.y - 5];
    // 左下点
    const c4 = [shape.x - barWidth + xAxisTranslation, shape.y];

    ctx
      .moveTo(c1[0], c1[1])
      .lineTo(c2[0], c2[1])
      .lineTo(c3[0], c3[1])
      .lineTo(c4[0], c4[1])
      .closePath();
  },
});
// 注册三个面图形
echarts.graphic.registerShape("CubeFront", CubeFront);
echarts.graphic.registerShape("CubeRight", CubeRight);
echarts.graphic.registerShape("CubeTop", CubeTop);

/**
 * 3D柱状图series生成
 * @param _colors 颜色
 * @param barGap 柱间距，必须大于等于柱宽
 * @param barWidth 柱宽
 * @returns
 */
const bar3DSeries = (
  _colors: echarts.Color,
  barGap: number = 25,
  barWidth: number = 20,
): echarts.SeriesOption & ChartOptionType => {
  const series = {
    type: "custom",
    renderItem: (
      params: echarts.EChartOption.SeriesCustom.RenderItemParams,
      api: echarts.EChartOption.SeriesCustom.RenderItemApi,
    ) => {
      const { seriesIndex = 0 } = params;

      const cubeLeftStyle =
        _colors ??
        new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: colors[0],
          },
          {
            offset: 1,
            color: "rgba(7, 20, 52,0.7)",
          },
        ]);
      const cubeRightStyle =
        _colors ??
        new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: "rgba(7, 20, 52,1)",
          },
          {
            offset: 1,
            color: colors[0],
          },
        ]);
      const cubeTopStyle =
        _colors ??
        new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: "rgba(7, 20, 52,1)",
          },
          {
            offset: 1,
            color: colors[0],
          },
        ]);

      const [value0, value1] = [api.value!(0), api.value!(1)];

      const location = api.coord!([value0, value1]);

      const xAxisTranslation = seriesIndex * barGap;

      if (value1 === 0) {
        return { type: "group", children: [] };
      }

      return {
        type: "group",
        children: [
          {
            type: "CubeFront",
            shape: {
              api,
              xValue: value0,
              yValue: value1,
              x: location[0],
              y: location[1],
              xAxisPoint: api.coord!([value0, 0]),
              xAxisTranslation,
              barWidth,
            },
            style: {
              fill: cubeLeftStyle,
            },
          },
          {
            type: "CubeRight",
            shape: {
              api,
              xValue: value0,
              yValue: value1,
              x: location[0],
              y: location[1],
              xAxisPoint: api.coord!([value0, 0]),
              xAxisTranslation,
              barWidth,
            },
            style: {
              fill: cubeRightStyle,
            },
          },
          {
            type: "CubeTop",
            shape: {
              api,
              xValue: value0,
              yValue: value1,
              x: location[0],
              y: location[1],
              xAxisPoint: api.coord!([value0, 0]),
              xAxisTranslation,
              barWidth,
            },
            style: {
              fill: cubeTopStyle,
            },
          },
        ],
      };
    },
  };

  return series as Series;
};

export default bar3DSeries;
