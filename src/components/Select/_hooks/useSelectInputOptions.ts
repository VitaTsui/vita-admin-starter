import { useEffect, useState } from "react";
import { SelectOption } from "..";

interface UseSelectInputOptionsProps {
  searchValue: string;
  isComposing: boolean;
  onChange?: (value: unknown) => void;
  onSearch?: (value: string) => void;
  optionsLength: number;
}

/**
 * 管理输入选项（当没有匹配项时）
 */
export function useSelectInputOptions({
  searchValue,
  isComposing,
  onChange,
  onSearch,
  optionsLength,
}: UseSelectInputOptionsProps) {
  const [inputOptions, setInputOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    if (!isComposing) {
      onSearch?.(searchValue);
    }
  }, [
    inputOptions,
    isComposing,
    onChange,
    onSearch,
    optionsLength,
    searchValue,
  ]);

  return { inputOptions, setInputOptions };
}
