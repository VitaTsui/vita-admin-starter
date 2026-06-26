import { useEffect, useState, useMemo, useCallback } from "react";
import { Equal } from "hsu-utils";
import { SearchCardOption } from "../_components/OptionRow";
import { getRealValues } from "../_utils";

interface UseSearchCardValueProps {
  defaultValue?: Record<string, unknown>;
  searchField: string;
  options: SearchCardOption[];
  onChange?: (data: Record<string, unknown>) => void;
}

/**
 * 管理 SearchCard 的值状态
 */
export function useSearchCardValue({
  defaultValue,
  searchField,
  options,
  onChange,
}: UseSearchCardValueProps) {
  const [value, setValue] = useState<Record<string, unknown>>({});
  const [lastValue, setLastValue] = useState<Record<string, unknown>>({});
  const [internalValue, setInternalValue] = useState<string>("");

  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue);
      setLastValue(defaultValue);
      setInternalValue((defaultValue[searchField] as string) || "");
    }
  }, [defaultValue, searchField]);

  // 处理内部值更新，将所有值保存在内部状态中
  const handleValueChange = useCallback((newValue: Record<string, unknown>) => {
    setValue({ ...newValue });
  }, []);

  // 获取真实值
  const getRealValuesData = useCallback(() => {
    return getRealValues(value, options, searchField);
  }, [value, options, searchField]);

  // 处理值变化
  useMemo(() => {
    if (onChange && !Equal.ObjEqual(value, lastValue)) {
      setLastValue(value);

      // 提取所有Real值
      const realValues = getRealValuesData();

      onChange(realValues);
    }
  }, [getRealValuesData, lastValue, onChange, value]);

  return {
    value,
    setValue: handleValueChange,
    internalValue,
    setInternalValue,
    getRealValues: getRealValuesData,
  };
}
