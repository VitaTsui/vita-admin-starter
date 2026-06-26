import { DefaultOptionType } from "antd/es/select";

interface FilterOptionParams {
  searchValue: string;
  option?: DefaultOptionType;
  isComposing: boolean;
  customFilterOption?: (
    searchValue: string,
    option?: DefaultOptionType
  ) => boolean;
  valueInlabel?: "before" | "after";
}

/**
 * 过滤选项
 */
export function filterOption({
  searchValue,
  option,
  isComposing,
  customFilterOption,
  valueInlabel,
}: FilterOptionParams): boolean {
  if (customFilterOption) {
    return customFilterOption(searchValue, option);
  }

  if (!isComposing) {
    const isMatch = (
      valueInlabel
        ? `${option?.label ?? ""} - ${option?.value ?? ""}`
        : option?.label ?? ""
    )
      .toString()
      .includes(searchValue.toString());

    return isMatch;
  }

  return true;
}
