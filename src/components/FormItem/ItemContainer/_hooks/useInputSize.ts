import { useMemo } from "react";

interface Params {
  inputWidth?: string | number;
  inputMinWidth?: string | number;
  inputHeight?: string | number;
  inputMinHeight?: string | number;
  height?: string | number;
}

export default function useInputSize(params: Params): {
  width: string;
  height: string;
  minHeight: string;
  horizontalMinWidth: string;
} {
  const { inputWidth, inputMinWidth, inputHeight, inputMinHeight, height } =
    params;

  const size = useMemo(() => {
    const _inputWidth =
      typeof inputWidth === "number" ? `${inputWidth}px` : inputWidth;
    const _width = _inputWidth ?? "100%";

    const _commonHeight = typeof height === "number" ? `${height}px` : height;

    const _input_inputHeight =
      typeof inputHeight === "number" ? `${inputHeight}px` : inputHeight;

    const _height = _input_inputHeight ?? _commonHeight ?? "max-content";

    const _input_inputMinHeight =
      typeof inputMinHeight === "number"
        ? `${inputMinHeight}px`
        : inputMinHeight;

    const _minHeight =
      _input_inputMinHeight ?? _input_inputHeight ?? _commonHeight ?? "32px";

    const _input_horizontalMinWidth =
      typeof inputMinWidth === "number" ? `${inputMinWidth}px` : inputMinWidth;
    const _horizontalMinWidth = _input_horizontalMinWidth ?? "0px";

    return {
      width: _width,
      height: _height,
      minHeight: _minHeight,
      horizontalMinWidth: _horizontalMinWidth,
    };
  }, [height, inputHeight, inputMinHeight, inputMinWidth, inputWidth]);

  return size;
}
