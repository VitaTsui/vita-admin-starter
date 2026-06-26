import { useEffect, useState } from "react";
import { useMutationObserver } from "ahooks";

interface Params {
  scroll?: boolean | { y: boolean };
  hideScrollbar?: boolean;
  cls?: string;
  ref?: React.RefObject<HTMLDivElement>;
  bordered?: boolean;
}

const useHideHeaderScrollbar = (params: Params) => {
  const { hideScrollbar, cls, ref, scroll, bordered } = params;
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    if (hideScrollbar && ref && ref.current && scroll && ready) {
      const timer = setInterval(() => {
        const headerBar = document.querySelector(
          `.${cls} .ant-table-cell-scrollbar`
        ) as HTMLDivElement;

        const fixedRight = document.querySelectorAll(
          `.${cls} .ant-table-thead .ant-table-cell-fix-right`
        ) as NodeListOf<HTMLDivElement>;

        const cols = document.querySelectorAll(
          `.${cls} .ant-table-header colgroup col`
        ) as NodeListOf<HTMLDivElement>;

        const summaryCols = document.querySelectorAll(
          `.${cls} .ant-table-summary colgroup col`
        ) as NodeListOf<HTMLDivElement>;

        if (headerBar) {
          clearInterval(timer);

          fixedRight?.forEach((item) => {
            const border = getComputedStyle(item, "::after");
            const right = parseInt(border.borderRightWidth);

            item.style.right =
              parseInt(item.style.right) -
              (headerBar?.clientWidth || 0) -
              right +
              "px";
          });

          const summaryColBar = [...summaryCols]?.slice?.(
            -1
          )?.[0] as HTMLDivElement;

          if (
            summaryColBar &&
            parseInt(summaryColBar.style.width) ===
              headerBar?.clientWidth + (bordered ? 1 : 0)
          ) {
            summaryColBar?.remove();
          }

          const colBar = [...cols]?.slice?.(-1)?.[0] as HTMLDivElement;

          if (
            colBar &&
            parseInt(colBar.style.width) ===
              headerBar?.clientWidth + (bordered ? 1 : 0)
          ) {
            colBar?.remove();
          }

          headerBar.remove();
        }
      }, 1);
    }
  }, [hideScrollbar, cls, ref, scroll, ready, bordered]);

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

export default useHideHeaderScrollbar;
