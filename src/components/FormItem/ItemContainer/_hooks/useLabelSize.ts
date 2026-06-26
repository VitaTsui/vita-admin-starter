import { useMemo } from "react";

interface Params {
  labelWidth?: string | number;
  labelHeight?: string | number;
  labelMinHeight?: string | number;
  height?: string | number;
}

export default function useLabelSize(params: Params): {
  width: string;
  height: string;
  minHeight: string;
} {
  const { labelWidth, labelHeight, labelMinHeight, height } = params;

  const size = useMemo(() => {
    const _labelWidth =
      typeof labelWidth === "number" ? `${labelWidth}px` : labelWidth;

    const _width = _labelWidth ?? "auto";

    const _commonHeight = typeof height === "number" ? `${height}px` : height;

    const _labelHeight =
      typeof labelHeight === "number" ? `${labelHeight}px` : labelHeight;

    const _height = _labelHeight ?? _commonHeight ?? "max-content";

    const _labelMinHeight =
      typeof labelMinHeight === "number"
        ? `${labelMinHeight}px`
        : labelMinHeight;

    const _minHeight = _labelMinHeight ?? _commonHeight ?? "32px";

    return {
      width: _width,
      height: _height,
      minHeight: _minHeight,
    };
  }, [height, labelHeight, labelMinHeight, labelWidth]);

  return size;
}
