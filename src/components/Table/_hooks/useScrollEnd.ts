import { useDebounceEffect, useMutationObserver } from "ahooks";
import { useRef, useState } from "react";
import { TableProps } from "..";

interface useScrollEndProps {
  cls?: string;
  ref?: React.RefObject<HTMLDivElement>;
  dataSource?: TableProps["dataSource"];
  onScrollEnd?: () => void;
  threshold?: number; // 距离底部的阈值，默认 50px
  autoScrolling?: boolean; // 当 autoScrolling 开启时，此 hook 不启用
}

const useScrollEnd = (props: useScrollEndProps) => {
  const {
    cls,
    ref,
    dataSource,
    onScrollEnd,
    threshold = 50,
    autoScrolling,
  } = props;
  const [ready, setReady] = useState(false);
  const eventHandlersRef = useRef<{
    scroll?: () => void;
  }>({});

  useDebounceEffect(() => {
    let body: HTMLDivElement | null = null;

    // 清理函数
    const cleanup = () => {
      // 移除事件监听器
      if (body && eventHandlersRef.current.scroll) {
        body.removeEventListener("scroll", eventHandlersRef.current.scroll);
      }
      eventHandlersRef.current = {};
    };

    // 当 autoScrolling 开启时，不启用此 hook
    if (
      ref &&
      ref.current &&
      ready &&
      onScrollEnd &&
      dataSource?.length &&
      !autoScrolling
    ) {
      body = document.querySelector(
        `.${cls} .ant-table-body`
      ) as HTMLDivElement;

      if (body && body.scrollHeight > body.clientHeight) {
        // 清理之前的监听器
        cleanup();

        // 添加滚动事件监听器
        const handleScroll = () => {
          if (!body) {
            return;
          }

          // 计算距离底部的距离
          const scrollTop = body.scrollTop;
          const scrollHeight = body.scrollHeight;
          const clientHeight = body.clientHeight;
          const distanceToBottom = scrollHeight - scrollTop - clientHeight;

          // 当滚动到接近底部时触发
          if (distanceToBottom <= threshold) {
            onScrollEnd();
          }
        };

        body.addEventListener("scroll", handleScroll, { passive: true });

        eventHandlersRef.current = {
          scroll: handleScroll,
        };
      }
    }

    return cleanup;
  }, [ref, cls, ready, dataSource, onScrollEnd, threshold, autoScrolling]);

  useMutationObserver(
    () => {
      setReady(true);
    },
    ref,
    {
      childList: true,
      subtree: true,
    }
  );
};

export default useScrollEnd;
