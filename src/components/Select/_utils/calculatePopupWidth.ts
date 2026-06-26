import { get_string_size } from "hsu-utils";
import { SelectOption } from "..";

interface CalculatePopupWidthOptions {
  options: SelectOption[];
  selectWidth: number;
  mode?: string;
  optionFontSize: number;
  valueInlabel?: "before" | "after";
}

/**
 * 计算弹出层宽度
 */
export function calculatePopupWidth({
  options,
  selectWidth,
  mode,
  optionFontSize,
  valueInlabel,
}: CalculatePopupWidthOptions): number {
  return options.reduce(
    (max, option) =>
      Math.max(
        max,
        get_string_size(
          valueInlabel ? `${option.label} - ${option.value}` : option.label,
          {
            size: optionFontSize,
          },
        ).width +
          (mode ? 50 : 30) +
          8,
      ),
    selectWidth,
  );
}
