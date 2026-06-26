import { useMutationObserver } from "ahooks";
import { useCallback, useEffect, useRef, useState } from "react";
import { TableProps } from "..";

const DEFAULT_INTERVAL = 2000;
const DEFAULT_SPEED = 25;
const SMOOTH_SCROLL_TICK = 10;
const EPSILON = 1;

type ScrollPhase = "idle" | "smooth" | "wait" | "loading" | "stopped";

interface UseAutoScrollingProps {
  cls?: string;
  autoScrolling?: boolean;
  ref?: React.RefObject<HTMLDivElement>;
  dataSource?: TableProps["dataSource"];
  interval?: number;
  autoScrollingSpeed?: number;
  onAutoScrollEndAdd?: () => Promise<boolean>;
  autoScrollMode?: "smooth" | "row";
  autoScrollLoop?: boolean;
  /** 循环模式："reset" 回到顶部重新滚动（默认），"seamless" 无缝衔接继续滚动 */
  autoScrollLoopMode?: "reset" | "seamless";
  autoScrollingOffset?: number;
}

const useAutoScrolling = (props: UseAutoScrollingProps) => {
  const {
    cls,
    autoScrolling,
    ref,
    dataSource,
    interval = DEFAULT_INTERVAL,
    autoScrollingSpeed = DEFAULT_SPEED,
    onAutoScrollEndAdd,
    autoScrollMode = "smooth",
    autoScrollLoop = true,
    autoScrollLoopMode = "reset",
    autoScrollingOffset = 0,
  } = props;

  const validSpeed =
    autoScrollingSpeed > 0 ? autoScrollingSpeed : DEFAULT_SPEED;
  const smoothStep = (validSpeed * SMOOTH_SCROLL_TICK) / 1000;

  const [ready, setReady] = useState(false);
  const [restartSeed, setRestartSeed] = useState(0);

  const rafRef = useRef<number | null>(null);
  const smoothTimerRef = useRef<NodeJS.Timeout | null>(null);
  const smoothTargetRef = useRef<number | null>(null);
  const smoothRemainderRef = useRef(0);
  const phaseRef = useRef<ScrollPhase>("idle");
  const waitUntilRef = useRef(0);
  const pauseRef = useRef(false);
  const pendingLoadMoreRef = useRef(false);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const loadTokenRef = useRef(0);
  const prevDataSourceRef = useRef<TableProps["dataSource"]>(dataSource);
  const hoverHandlersRef = useRef<{
    mouseenter?: () => void;
    mouseleave?: () => void;
  }>({});

  // seamless 模式相关
  const isSeamless = autoScrollLoopMode === "seamless" && autoScrollLoop;
  const originalRowsHeightRef = useRef(0);
  const clonedNodesRef = useRef<Node[]>([]);
  const seamlessReadyRef = useRef(false);

  const triggerRestart = useCallback(() => {
    setRestartSeed((prev) => prev + 1);
  }, []);

  const cleanupClones = useCallback(() => {
    clonedNodesRef.current.forEach((node) => {
      if (node.parentNode) node.parentNode.removeChild(node);
    });
    clonedNodesRef.current = [];
    originalRowsHeightRef.current = 0;
    seamlessReadyRef.current = false;
  }, []);

  const setupSeamlessClones = useCallback(
    (body: HTMLDivElement) => {
      if (seamlessReadyRef.current) return;
      cleanupClones();

      const tbody = body.querySelector(".ant-table-tbody");
      if (!tbody) return;

      const rows = Array.from(
        tbody.querySelectorAll(":scope > tr:not([data-seamless-clone])"),
      );
      if (!rows.length) return;

      let height = 0;
      rows.forEach((row) => {
        height += (row as HTMLElement).offsetHeight;
      });

      // 内容不足一屏时不需要无缝滚动
      if (height <= body.clientHeight) return;

      originalRowsHeightRef.current = height;

      const clones: Node[] = [];
      rows.forEach((row) => {
        const clone = row.cloneNode(true) as HTMLElement;
        clone.setAttribute("data-seamless-clone", "true");
        tbody.appendChild(clone);
        clones.push(clone);
      });
      clonedNodesRef.current = clones;
      seamlessReadyRef.current = true;
    },
    [cleanupClones],
  );

  const checkSeamlessReset = useCallback((body: HTMLDivElement): void => {
    const h = originalRowsHeightRef.current;
    if (h > 0 && body.scrollTop >= h) {
      body.scrollTop -= h;
      if (smoothTargetRef.current !== null) {
        smoothTargetRef.current -= h;
      }
    }
  }, []);

  const getBody = useCallback((): HTMLDivElement | null => {
    if (!cls) return null;
    return document.querySelector(`.${cls} .ant-table-body`) as HTMLDivElement;
  }, [cls]);

  const isBodyScrollable = useCallback(
    (body: HTMLDivElement | null): boolean => {
      if (!body || !body.isConnected) return false;
      const rect = body.getBoundingClientRect();
      return (
        (rect.width > 0 || rect.height > 0) &&
        body.scrollHeight > 0 &&
        body.scrollHeight - body.clientHeight > autoScrollingOffset
      );
    },
    [autoScrollingOffset],
  );

  const isAtBottom = useCallback((body: HTMLDivElement): boolean => {
    return body.scrollTop + body.clientHeight >= body.scrollHeight - EPSILON;
  }, []);

  const clearSmoothTimer = useCallback(() => {
    if (smoothTimerRef.current) {
      clearInterval(smoothTimerRef.current);
      smoothTimerRef.current = null;
    }
    smoothTargetRef.current = null;
    smoothRemainderRef.current = 0;
  }, []);

  const unbindHover = useCallback(() => {
    const body = bodyRef.current;
    if (!body) return;
    const { mouseenter, mouseleave } = hoverHandlersRef.current;
    if (mouseenter) body.removeEventListener("mouseenter", mouseenter);
    if (mouseleave) body.removeEventListener("mouseleave", mouseleave);
    hoverHandlersRef.current = {};
    bodyRef.current = null;
  }, []);

  const bindHover = useCallback(
    (body: HTMLDivElement) => {
      if (
        bodyRef.current === body &&
        hoverHandlersRef.current.mouseenter &&
        hoverHandlersRef.current.mouseleave
      ) {
        return;
      }

      unbindHover();

      const handleMouseEnter = () => {
        pauseRef.current = true;
      };
      const handleMouseLeave = () => {
        pauseRef.current = false;
      };

      body.addEventListener("mouseenter", handleMouseEnter);
      body.addEventListener("mouseleave", handleMouseLeave);

      bodyRef.current = body;
      hoverHandlersRef.current = {
        mouseenter: handleMouseEnter,
        mouseleave: handleMouseLeave,
      };
    },
    [unbindHover],
  );

  const resetCycle = useCallback(() => {
    phaseRef.current = "idle";
    waitUntilRef.current = 0;
    pendingLoadMoreRef.current = false;
    pauseRef.current = false;
    loadTokenRef.current += 1;
    clearSmoothTimer();
  }, [clearSmoothTimer]);

  const cleanup = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    resetCycle();
    unbindHover();
    cleanupClones();
  }, [resetCycle, unbindHover, cleanupClones]);

  const getRowHeight = useCallback((body: HTMLDivElement): number => {
    const rows = body.querySelectorAll(".ant-table-tbody > .ant-table-row");
    if (!rows.length) return 0;

    const bodyTop = body.getBoundingClientRect().top;
    for (const row of rows) {
      const element = row as HTMLDivElement;
      const rect = element.getBoundingClientRect();
      if (rect.bottom > bodyTop + EPSILON && element.offsetHeight > 0) {
        return element.offsetHeight;
      }
    }

    return (rows[0] as HTMLDivElement).offsetHeight || 0;
  }, []);

  const startSmoothStep = useCallback(
    (body: HTMLDivElement, targetTop: number) => {
      clearSmoothTimer();
      smoothTargetRef.current = targetTop;
      phaseRef.current = "smooth";

      smoothTimerRef.current = setInterval(() => {
        const currentBody = getBody() ?? body;
        if (!isBodyScrollable(currentBody)) {
          clearSmoothTimer();
          phaseRef.current = "idle";
          return;
        }
        bindHover(currentBody);
        if (pauseRef.current) return;

        const target = smoothTargetRef.current;
        if (target === null) {
          clearSmoothTimer();
          phaseRef.current = "idle";
          return;
        }

        const maxScrollTop =
          currentBody.scrollHeight - currentBody.clientHeight;
        const limitedTarget = Math.min(target, maxScrollTop);
        const remainingDistance = limitedTarget - currentBody.scrollTop;

        if (remainingDistance <= EPSILON || (!isSeamless && isAtBottom(currentBody))) {
          currentBody.scrollTop = Math.min(limitedTarget, maxScrollTop);
          if (isSeamless) {
            checkSeamlessReset(currentBody);
            clearSmoothTimer();
            phaseRef.current = "idle";
          } else {
            clearSmoothTimer();
            if (isAtBottom(currentBody)) {
              phaseRef.current = "wait";
              waitUntilRef.current = performance.now() + interval;
            } else {
              phaseRef.current = "idle";
            }
          }
          return;
        }

        smoothRemainderRef.current += smoothStep;
        const moveDistance = Math.floor(smoothRemainderRef.current);
        if (moveDistance <= 0) return;

        smoothRemainderRef.current -= moveDistance;
        currentBody.scrollTop = Math.min(
          limitedTarget,
          currentBody.scrollTop + moveDistance,
        );

        if (isSeamless) {
          checkSeamlessReset(currentBody);
          if (currentBody.scrollTop >= (smoothTargetRef.current ?? limitedTarget)) {
            clearSmoothTimer();
            phaseRef.current = "idle";
          }
        } else if (currentBody.scrollTop >= limitedTarget || isAtBottom(currentBody)) {
          if (isAtBottom(currentBody)) {
            currentBody.scrollTop = maxScrollTop;
          }
          clearSmoothTimer();
          if (isAtBottom(currentBody)) {
            phaseRef.current = "wait";
            waitUntilRef.current = performance.now() + interval;
          } else {
            phaseRef.current = "idle";
          }
        }
      }, SMOOTH_SCROLL_TICK);
    },
    [
      bindHover,
      checkSeamlessReset,
      clearSmoothTimer,
      getBody,
      interval,
      isAtBottom,
      isBodyScrollable,
      isSeamless,
      smoothStep,
    ],
  );

  const runLoadMore = useCallback(() => {
    if (!onAutoScrollEndAdd || pendingLoadMoreRef.current) return;
    pendingLoadMoreRef.current = true;
    phaseRef.current = "loading";
    const token = ++loadTokenRef.current;

    onAutoScrollEndAdd()
      .then((hasMore) => {
        if (token !== loadTokenRef.current) return;
        const currentBody = getBody();
        if (hasMore) {
          phaseRef.current = "idle";
          return;
        }
        if (autoScrollLoop && currentBody && currentBody.isConnected) {
          currentBody.scrollTop = 0;
          phaseRef.current = "idle";
          return;
        }
        phaseRef.current = "stopped";
      })
      .catch(() => {
        if (token !== loadTokenRef.current) return;
        phaseRef.current = "idle";
      })
      .finally(() => {
        if (token !== loadTokenRef.current) return;
        pendingLoadMoreRef.current = false;
      });
  }, [autoScrollLoop, getBody, onAutoScrollEndAdd]);

  const loop = useCallback(() => {
    rafRef.current = requestAnimationFrame(loop);

    if (!autoScrolling || !ready || !dataSource?.length || !ref?.current) {
      return;
    }

    const body = getBody();
    if (!body) {
      return;
    }
    const bodyScrollable = isBodyScrollable(body);
    if (bodyScrollable) {
      bindHover(body);
      if (isSeamless) setupSeamlessClones(body);
    }

    if (pauseRef.current) {
      return;
    }

    if (phaseRef.current === "loading") {
      return;
    }

    if (phaseRef.current === "stopped") {
      return;
    }

    if (phaseRef.current === "wait") {
      if (performance.now() < waitUntilRef.current) {
        return;
      }
      if (isSeamless && seamlessReadyRef.current) {
        // 无缝模式下不会真正到底，直接继续滚动
        phaseRef.current = "idle";
      } else if (isAtBottom(body)) {
        if (onAutoScrollEndAdd) {
          runLoadMore();
        } else {
          if (autoScrollLoop) {
            body.scrollTop = 0;
            phaseRef.current = autoScrollMode === "row" ? "wait" : "idle";
            waitUntilRef.current =
              autoScrollMode === "row" ? performance.now() + interval : 0;
          } else {
            phaseRef.current = "stopped";
            waitUntilRef.current = 0;
          }
        }
      } else {
        phaseRef.current = "idle";
      }
      return;
    }

    if (phaseRef.current === "smooth") {
      return;
    }

    // 内容不足一屏时，也按“滚动到底”处理，触发 load-more 逻辑
    if (!bodyScrollable) {
      phaseRef.current = "wait";
      waitUntilRef.current = performance.now() + interval;
      return;
    }

    const rowHeight = getRowHeight(body);
    if (rowHeight <= 0) {
      return;
    }

    const maxScrollTop = body.scrollHeight - body.clientHeight;
    const targetTop = Math.min(body.scrollTop + rowHeight, maxScrollTop);

    if (targetTop <= body.scrollTop + EPSILON || (!isSeamless && isAtBottom(body))) {
      phaseRef.current = "wait";
      waitUntilRef.current = performance.now() + interval;
      return;
    }

    if (autoScrollMode === "row") {
      body.scrollTop = targetTop;
      if (isSeamless) checkSeamlessReset(body);
      phaseRef.current = "wait";
      waitUntilRef.current = performance.now() + interval;
      return;
    }

    startSmoothStep(body, targetTop);
  }, [
    autoScrollMode,
    autoScrollLoop,
    autoScrolling,
    bindHover,
    checkSeamlessReset,
    dataSource,
    getBody,
    getRowHeight,
    interval,
    isAtBottom,
    isBodyScrollable,
    isSeamless,
    onAutoScrollEndAdd,
    ready,
    ref,
    runLoadMore,
    setupSeamlessClones,
    startSmoothStep,
  ]);

  useEffect(() => {
    if (!autoScrolling || !ready || !dataSource?.length || !ref?.current) {
      cleanup();
      return cleanup;
    }

    resetCycle();
    phaseRef.current = autoScrollMode === "row" ? "wait" : "idle";
    waitUntilRef.current =
      autoScrollMode === "row" ? performance.now() + interval : 0;

    rafRef.current = requestAnimationFrame(loop);
    return cleanup;
  }, [
    autoScrollMode,
    autoScrolling,
    cleanup,
    dataSource,
    interval,
    loop,
    ready,
    ref,
    resetCycle,
    restartSeed,
  ]);

  useEffect(() => {
    const changed = prevDataSourceRef.current !== dataSource;
    prevDataSourceRef.current = dataSource;

    const body = getBody();
    if (!changed || !body) return;

    // 无缝模式：实时刷新场景下保留滚动进度，clone 节点交由 loop 在下一帧按需重建，
    // 避免每次轮询都把 scrollTop 重置为 0 导致用户视觉上"不滚动"。
    if (isSeamless) {
      cleanupClones();
      return;
    }

    if (onAutoScrollEndAdd) {
      // 当 load-more 模式且此前已停止时，有新数据后恢复自动滚动
      if (phaseRef.current === "stopped") {
        phaseRef.current = autoScrollMode === "row" ? "wait" : "idle";
        waitUntilRef.current =
          autoScrollMode === "row" ? performance.now() + interval : 0;
      }
      return;
    }

    if (isBodyScrollable(body)) {
      body.scrollTop = 0;
      phaseRef.current = autoScrollMode === "row" ? "wait" : "idle";
      waitUntilRef.current =
        autoScrollMode === "row" ? performance.now() + interval : 0;
    }
  }, [
    autoScrollMode,
    cleanupClones,
    dataSource,
    getBody,
    interval,
    isBodyScrollable,
    isSeamless,
    onAutoScrollEndAdd,
  ]);

  useEffect(() => {
    if (!autoScrolling || !ref?.current) return;

    let resizeRaf: number | null = null;
    const scheduleRestart = () => {
      if (resizeRaf !== null) {
        cancelAnimationFrame(resizeRaf);
      }
      resizeRaf = requestAnimationFrame(() => {
        triggerRestart();
      });
    };

    window.addEventListener("resize", scheduleRestart);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && ref.current) {
      observer = new ResizeObserver(() => {
        scheduleRestart();
      });
      observer.observe(ref.current);
    }

    return () => {
      window.removeEventListener("resize", scheduleRestart);
      if (resizeRaf !== null) {
        cancelAnimationFrame(resizeRaf);
      }
      observer?.disconnect();
    };
  }, [autoScrolling, ref, triggerRestart]);

  useMutationObserver(
    () => {
      setReady(true);
    },
    ref,
    {
      childList: true,
      subtree: true,
    },
  );
};

export default useAutoScrolling;
