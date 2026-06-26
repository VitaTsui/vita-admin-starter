import { useState, useCallback } from "react";

interface UseSearchCardCollapseProps {
  defaultCollapse?: boolean;
}

/**
 * 管理 SearchCard 的折叠状态
 */
export function useSearchCardCollapse({
  defaultCollapse = false,
}: UseSearchCardCollapseProps) {
  const [collapse, setCollapse] = useState(defaultCollapse);

  const handleCollapseToggle = useCallback(() => {
    setCollapse(!collapse);
  }, [collapse]);

  return {
    collapse,
    setCollapse,
    toggleCollapse: handleCollapseToggle,
  };
}

