import G6, {
  IGroup,
  Item,
  ModelConfig,
  ShapeOptions,
  ShapeStyle,
} from "@antv/g6";
import { NodeColor, NodeStyle } from ".";
import { getTextSize } from ".";
import { TreeGraphData } from "..";

// ==================== 常量定义 ====================
const DEFAULT_PADDING = 20; // 节点内边距
const DEFAULT_LINE_HEIGHT = 18; // 行高
const DEFAULT_LINE_GAP = 2; // 行间距
const DEFAULT_ICON_RADIUS = 8; // 折叠图标半径
const DEFAULT_FONT_SIZE = 20; // 根节点默认字体大小
const DEFAULT_TEXT_COLOR = "#0c0d0e"; // 默认文本颜色
const DEFAULT_BG_COLOR = "#fff"; // 默认背景颜色
const DEFAULT_STROKE_COLOR = "#4096ff"; // 默认边框颜色
const DEFAULT_HOVER_TEXT_COLOR = "#fff"; // 悬停时文本颜色
const TEXT_WIDTH_TOLERANCE = 0.01; // 文本宽度容差

interface RootNodeProps {
  showPort?: boolean;
  styles?: NodeStyle;
  colors?: NodeColor[];
  hoverColors?: NodeColor[];
  selectedColors?: NodeColor[];
  rootLevel?: number;
  hasHover?: boolean;
  hasSelected?: boolean;
  addShape?: (
    group: IGroup,
    cfg: ModelConfig & { origin?: Record<string, unknown> }
  ) => void;
}

export default function RootNode(rootNodeProps: RootNodeProps): ShapeOptions {
  const {
    styles,
    colors = [],
    hoverColors = [],
    selectedColors = [],
    rootLevel = 1,
    hasHover = true,
    hasSelected = true,
    addShape,
  } = rootNodeProps || {};
  const {
    textStyle,
    textSelectedStyle,
    textHoverStyle,
    textAlign = "default",
    bgStyle,
    selectedBgStyle,
    hoverBgStyle,
    collapseIconStyle,
    maxWidth,
    render,
  } = styles || {};

  // ==================== 文本样式 ====================
  const _textStyle: ShapeStyle = {
    fill: DEFAULT_TEXT_COLOR,
    fontSize: DEFAULT_FONT_SIZE,
    fontWeight: "bold",
    ...textStyle,
  };

  const _textSelectedStyle: ShapeStyle = {
    fill: DEFAULT_HOVER_TEXT_COLOR,
    ...textSelectedStyle,
  };

  const _textHoverStyle: ShapeStyle = {
    fill: DEFAULT_HOVER_TEXT_COLOR,
    ...textHoverStyle,
  };

  // ==================== 背景样式 ====================
  const _bgStyle: ShapeStyle = {
    fill: DEFAULT_BG_COLOR,
    stroke: DEFAULT_STROKE_COLOR,
    lineWidth: 1,
    radius: 4,
    ...bgStyle,
  };

  const _selectedBgStyle: ShapeStyle = {
    fill: DEFAULT_STROKE_COLOR,
    ...selectedBgStyle,
  };

  const _hoverBgStyle: ShapeStyle = {
    fill: DEFAULT_STROKE_COLOR,
    ...hoverBgStyle,
  };

  // ==================== 展开折叠Icon样式 ====================
  const _collapseIconStyle: ShapeStyle = {
    stroke: DEFAULT_STROKE_COLOR,
    lineWidth: 1,
    fill: DEFAULT_BG_COLOR,
    ...collapseIconStyle,
  };

  // ==================== 配置 ====================
  const options = {
    styles: {},
  };

  // ==================== 获取颜色配置 ====================
  const getColorConfig = (item: Item) => {
    const index = (item._cfg?.model?.level as number) - rootLevel;
    return {
      color: colors?.[index % colors.length],
      hoverColor: hoverColors?.[index % hoverColors.length],
      selectedColor: selectedColors?.[index % selectedColors.length],
    };
  };

  // ==================== 设置状态 ====================
  const setState = (name?: string, value?: string | boolean, item?: Item) => {
    if (!item) return;

    const group = item.get<IGroup>("group");
    const collapseShape = group.find((e) => e.get("name") === "collapse-icon");
    const textShape = group.find((e) => e.get("name") === "text-shape");
    const keyShape = item.getKeyShape();

    const { color, hoverColor, selectedColor } = getColorConfig(item);

    // 处理折叠状态
    if (name === "collapse") {
      collapseShape?.attr({
        symbol: value ? G6.Marker.collapse : G6.Marker.expand,
      });
      return;
    }

    // 处理悬停状态
    if (name === "hover" && !item.hasState("click") && hasHover) {
      const isHover = Boolean(value);
      const renderStyle = render?.(
        item._cfg as ModelConfig,
        isHover ? "hover" : "default"
      );

      const bgStyle = isHover ? _hoverBgStyle : _bgStyle;
      const textStyle = isHover ? _textHoverStyle : _textStyle;
      const currentColor = isHover ? hoverColor : color;

      keyShape?.attr({
        ...bgStyle,
        fill: currentColor?.bg ?? color?.bg ?? bgStyle.fill,
        stroke: currentColor?.stroke ?? color?.stroke ?? bgStyle.stroke,
        ...renderStyle?.bgStyle,
      });

      textShape?.attr({
        ...textStyle,
        fill: currentColor?.text ?? color?.text ?? textStyle.fill,
        ...renderStyle?.textStyle,
      });
      return;
    }

    // 处理选中状态
    if (name === "click" && hasSelected) {
      const isSelected = Boolean(value);
      const renderStyle = render?.(
        item._cfg as ModelConfig,
        isSelected ? "selected" : "default"
      );

      const bgStyle = isSelected ? _selectedBgStyle : _bgStyle;
      const textStyle = isSelected ? _textSelectedStyle : _textStyle;
      const currentColor = isSelected ? selectedColor : color;

      keyShape?.attr({
        ...bgStyle,
        fill: currentColor?.bg ?? color?.bg ?? bgStyle.fill,
        stroke: currentColor?.stroke ?? color?.stroke ?? bgStyle.stroke,
        ...renderStyle?.bgStyle,
      });

      textShape?.attr({
        ...textStyle,
        fill: currentColor?.text ?? color?.text ?? textStyle.fill,
        ...renderStyle?.textStyle,
      });
    }
  };

  // ==================== 文本换行处理 ====================
  const wrapText = (label: string, maxWidth: number): string[] => {
    const lines: string[] = [];
    let currentLine = "";
    const labelChars = label.split("");

    labelChars?.forEach((char, idx) => {
      const { width: charWidth } = getTextSize(currentLine + char, _textStyle);
      const availableWidth = maxWidth - DEFAULT_PADDING * 2;

      if (charWidth - TEXT_WIDTH_TOLERANCE > availableWidth) {
        lines.push(currentLine);
        currentLine = char;
      } else {
        currentLine += char;
      }

      if (idx === labelChars.length - 1) {
        lines.push(currentLine);
      }
    });

    return lines.length > 0 ? lines : [label];
  };

  // ==================== 计算节点尺寸 ====================
  const calculateNodeSize = (
    label: string,
    fontSize: number
  ): { width: number; height: number; lines: string[] } => {
    const { width, height } = getTextSize(label, _textStyle);
    const minWidth = fontSize + DEFAULT_PADDING * 2;
    const nodeWidth = maxWidth
      ? Math.max(maxWidth, minWidth)
      : width + DEFAULT_PADDING * 2;

    const lines = wrapText(label, nodeWidth);
    const lineCount = lines.length;
    const nodeHeight =
      height * lineCount +
      DEFAULT_LINE_HEIGHT +
      (lineCount - 1) * DEFAULT_LINE_GAP;

    return { width: nodeWidth, height: nodeHeight, lines };
  };

  // ==================== 绘制 ====================
  const draw = (cfg: ModelConfig, group: IGroup) => {
    const renderStyle = render?.(cfg, "default");
    cfg.textStyle = { ..._textStyle, ...renderStyle?.textStyle };

    const index = (cfg.level as number) - rootLevel;
    const color = colors?.[index % colors.length];
    const fontSize = _textStyle.fontSize ?? DEFAULT_FONT_SIZE;

    const {
      width: nodeWidth,
      height: nodeHeight,
      lines,
    } = calculateNodeSize(cfg.label as string, fontSize);

    const lineCount = lines.length;
    const textHeight = getTextSize(cfg.label as string, _textStyle).height;

    cfg.width = nodeWidth;
    cfg.height = nodeHeight;
    cfg.line = lineCount;

    // 绘制背景
    const node = group.addShape("rect", {
      attrs: {
        ..._bgStyle,
        fill: color?.bg ?? _bgStyle.fill,
        stroke: color?.stroke ?? _bgStyle.stroke,
        ...renderStyle?.bgStyle,
        width: nodeWidth,
        height: nodeHeight,
        x: -nodeWidth / 2,
        y: -(nodeHeight - DEFAULT_LINE_HEIGHT) / lineCount,
      },
      name: "rect-shape",
    });

    // 绘制文本
    lines?.forEach((line, lineIndex) => {
      const { width: lineWidth } = getTextSize(line, _textStyle);
      const textX =
        textAlign === "center"
          ? -lineWidth / 2
          : -nodeWidth / 2 + DEFAULT_PADDING;
      const textY =
        textHeight * lineIndex +
        DEFAULT_LINE_HEIGHT / 2 +
        lineIndex * DEFAULT_LINE_GAP;

      group.addShape("text", {
        attrs: {
          ..._textStyle,
          fill: color?.text ?? _textStyle.fill,
          ...renderStyle?.textStyle,
          text: line,
          x: textX,
          y: textY,
          position: cfg.direction as string,
        },
        name: "text-shape",
      });
    });

    // 绘制展开折叠图标
    const hasChildren =
      cfg.children && (cfg.children as TreeGraphData[]).length > 0;
    if (hasChildren) {
      const iconX = nodeWidth / 2;
      const iconY =
        -(nodeHeight - DEFAULT_LINE_HEIGHT) / lineCount + nodeHeight / 2;

      group.addShape("marker", {
        attrs: {
          r: DEFAULT_ICON_RADIUS,
          ..._collapseIconStyle,
          x: iconX,
          y: iconY,
          symbol: cfg.collapsed ? G6.Marker.expand : G6.Marker.collapse,
          cursor: "pointer",
        },
        name: "collapse-icon",
      });
    }

    // 自定义形状
    if (addShape) {
      addShape(group, cfg);
    }

    return node;
  };

  return {
    options,
    setState,
    draw,
  };
}
