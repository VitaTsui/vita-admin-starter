import { useCallback, useMemo, useState } from "react";
import { FormItemProps } from "@/components/FormItem";

/**
 * 管理搜索项状态
 *
 * 通过 useMemo 直接从入参派生，仅把用户在 FilterDropdown 里手动切换的
 * visible 覆盖保存为 state；避免 useEffect 镜像 prop 时因为父组件传入
 * 新数组引用而反复 setState，从而触发 Maximum update depth 循环。
 */
export function useSearchItems(searchItems: FormItemProps[]) {
  const [visibilityOverrides, setVisibilityOverrides] = useState<
    Record<string, boolean>
  >({});

  const processedSearchItems = useMemo<FormItemProps[]>(() => {
    return (
      searchItems?.map((i) => {
        const key =
          i.name !== undefined && i.name !== null ? String(i.name) : "";
        const override = key ? visibilityOverrides[key] : undefined;
        return {
          ...i,
          visible:
            override !== undefined
              ? override
              : typeof i.visible === "boolean"
                ? i.visible
                : true,
        };
      }) ?? []
    );
  }, [searchItems, visibilityOverrides]);

  const setSearchItems = useCallback((items: FormItemProps[]) => {
    const overrides: Record<string, boolean> = {};
    items?.forEach((item) => {
      if (
        item.name !== undefined &&
        item.name !== null &&
        typeof item.visible === "boolean"
      ) {
        overrides[String(item.name)] = item.visible;
      }
    });
    setVisibilityOverrides(overrides);
  }, []);

  return {
    searchItems: processedSearchItems,
    setSearchItems,
  };
}
