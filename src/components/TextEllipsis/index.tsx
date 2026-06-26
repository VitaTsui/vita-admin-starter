import { Tooltip, TooltipProps } from "antd";
import { ReactNode, useEffect, useRef, useState } from "react";
import cssStyles from "./index.module.less";

// 默认 Tooltip 宽度
const DEFAULT_TOOLTIP_WIDTH = 200;

export interface TextEllipsisProps {
  /** 要显示的文本内容 */
  children: ReactNode;
  /** 容器宽度，用于计算 Tooltip 宽度 */
  width?: number | string;
  /** Tooltip 配置 */
  tooltipConfig?: Omit<TooltipProps, "title" | "children"> & {
    /** 默认 Tooltip 宽度（当没有设置 width 时使用） */
    defaultWidth?: number;
  };
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 自定义类名 */
  className?: string;
  /** 是否禁用 Tooltip（即使文本溢出也不显示） */
  disabled?: boolean;
  /** 省略号位置，'start' 表示省略前面(...xxx)，'end' 表示省略后面(xxx...) */
  ellipsisPosition?: "start" | "end";
  /** container 样式 */
  containerStyle?: React.CSSProperties;
}

/**
 * 文本溢出组件
 * 当文本溢出时自动显示 Tooltip，并省略超出文本
 */
const TextEllipsis: React.FC<TextEllipsisProps> = ({
  children,
  width,
  tooltipConfig,
  style,
  className,
  disabled = false,
  ellipsisPosition = "end",
  containerStyle,
}) => {
  const textRef = useRef<HTMLSpanElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [isOverflow, setIsOverflow] = useState(false);
  const [truncatedText, setTruncatedText] = useState<ReactNode>(children);

  useEffect(() => {
    const element = textRef.current;
    const measureElement = measureRef.current;
    if (!element || !measureElement) return;

    // 将 children 转换为字符串
    const getTextContent = (node: ReactNode): string => {
      if (typeof node === "string" || typeof node === "number") {
        return String(node);
      }
      if (Array.isArray(node)) {
        return node?.map(getTextContent).join("");
      }
      return "";
    };

    // 同步测量元素的样式
    const computedStyle = window.getComputedStyle(element);
    measureElement.style.fontSize = computedStyle.fontSize;
    measureElement.style.fontFamily = computedStyle.fontFamily;
    measureElement.style.fontWeight = computedStyle.fontWeight;
    measureElement.style.fontStyle = computedStyle.fontStyle;
    measureElement.style.letterSpacing = computedStyle.letterSpacing;
    measureElement.style.padding = computedStyle.padding;
    measureElement.style.border = computedStyle.border;
    measureElement.style.boxSizing = computedStyle.boxSizing;

    // 计算截断后的文本（省略前面）
    const calculateTruncatedText = (text: string, maxWidth: number): string => {
      const ellipsis = "...";

      // 如果整个文本都不溢出，直接返回
      measureElement.textContent = text;
      if (measureElement.offsetWidth <= maxWidth) {
        return text;
      }

      // 二分查找找到合适的截断点
      let left = 0;
      let right = text.length;
      let result = text;

      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const truncated = ellipsis + text.slice(mid);
        measureElement.textContent = truncated;

        if (measureElement.offsetWidth <= maxWidth) {
          result = truncated;
          right = mid - 1;
        } else {
          left = mid + 1;
        }
      }

      return result;
    };

    const textContent = getTextContent(children);
    const isTextOverflow =
      element.scrollWidth > element.clientWidth ||
      element.scrollHeight > element.clientHeight;

    setIsOverflow(isTextOverflow);

    // 如果是省略前面且文本溢出，需要计算截断后的文本
    if (ellipsisPosition === "start" && isTextOverflow && textContent) {
      const maxWidth = element.clientWidth;
      const truncated = calculateTruncatedText(textContent, maxWidth);
      setTruncatedText(truncated);
    } else {
      setTruncatedText(children);
    }
  }, [children, ellipsisPosition, style]);

  // 计算 Tooltip 的宽度
  const getTooltipWidth = () => {
    const defaultWidth = tooltipConfig?.defaultWidth ?? DEFAULT_TOOLTIP_WIDTH;
    if (!width) return defaultWidth;
    if (typeof width === "number") return width;
    if (typeof width === "string" && width.includes("%")) return defaultWidth;
    return parseInt(width) || defaultWidth;
  };

  const tooltipWidth = getTooltipWidth();

  // 从 tooltipConfig 中提取配置，移除 defaultWidth
  const { defaultWidth, styles, ...restTooltipConfig } = tooltipConfig || {};
  void defaultWidth;

  // 尝试将 children 格式化为 JSON
  const formatTooltipTitle = (content: ReactNode): ReactNode => {
    if (typeof content !== "string") return content;

    try {
      const parsed = JSON.parse(content);
      return JSON.stringify(parsed, null, 2);
    } catch {
      // 如果不是有效的 JSON，返回原内容
      return content;
    }
  };

  const tooltipTitle = formatTooltipTitle(children);

  const content = (
    <span className={cssStyles.container} style={containerStyle}>
      {/* 隐藏的测量元素 */}
      <span
        ref={measureRef}
        className={cssStyles.measureElement}
        aria-hidden="true"
      />
      <span
        ref={textRef}
        className={`${cssStyles.textElement} ${
          ellipsisPosition === "end"
            ? cssStyles.ellipsisEnd
            : cssStyles.ellipsisStart
        } ${className || ""}`}
        style={style}
        title="" // 禁用浏览器默认 tooltip
      >
        {ellipsisPosition === "start" ? truncatedText : children}
      </span>
    </span>
  );

  // 只在溢出且未禁用时显示 Tooltip
  if (isOverflow && !disabled) {
    return (
      <Tooltip
        arrow={false}
        placement="bottomLeft"
        {...restTooltipConfig}
        title={tooltipTitle}
        styles={{
          body: {
            width: tooltipWidth,
            overflow: "auto",
            maxHeight: "300px",
            whiteSpace: "pre-wrap",
          },
          ...styles,
        }}
      >
        {content}
      </Tooltip>
    );
  }

  return content;
};

export default TextEllipsis;
