import { useEffect, useState } from "react";

interface UseAssistantNavigationProps {
  itemLength: number;
}

/**
 * 管理 Assistant 组件中的导航状态（切换不同的答案）
 */
export function useAssistantNavigation({
  itemLength,
}: UseAssistantNavigationProps) {
  const [num, setNum] = useState(itemLength - 1);

  useEffect(() => {
    setNum(itemLength - 1);
  }, [itemLength]);

  const goPrev = () => {
    if (num > 0) {
      setNum(num - 1);
    }
  };

  const goNext = () => {
    if (num < itemLength - 1) {
      setNum(num + 1);
    }
  };

  return {
    currentIndex: num,
    setCurrentIndex: setNum,
    goPrev,
    goNext,
    isFirst: num === 0,
    isLast: num === itemLength - 1,
  };
}

