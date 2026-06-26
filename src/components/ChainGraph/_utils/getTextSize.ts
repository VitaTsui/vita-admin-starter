import { ShapeStyle } from "@antv/g6";
import { get_string_size } from "hsu-utils";

/**
 * 获取文字大小
 * @param text 文本内容
 * @param textStyle 文本样式
 * @returns 文本的宽度和高度
 */
export const getTextSize = (text: string, textStyle: ShapeStyle) => {
  if (!text) return { width: 0, height: 0 };

  const { width, height } = get_string_size(text, {
    size: Number(textStyle.fontSize),
    weight: textStyle.fontWeight?.toString(),
    family: textStyle.fontFamily,
  });

  return { width, height };
};

