import { TableProps } from "..";
import { useState } from "react";
import { useEffect } from "react";
import { useMutationObserver } from "ahooks";

interface Params {
  pagination?: TableProps["pagination"];
  scroll?: TableProps["scroll"];
  scrollAutoHeight?: boolean;
  ref?: React.RefObject<HTMLDivElement>;
  dataSource?: TableProps["dataSource"];
  cls?: string;
  fillPanel?: boolean;
  columns?: TableProps["columns"];
  bordered?: boolean;
  virtual?: boolean;
}

const useSetTableHeight = (params: Params) => {
  const {
    pagination,
    scroll,
    scrollAutoHeight,
    ref,
    dataSource,
    cls,
    fillPanel,
    columns,
    bordered,
    virtual,
  } = params;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (scroll && ref && ref.current && ready && columns?.length && !virtual) {
      const header = document.querySelector(
        `.${cls} .ant-table-header`,
      ) as HTMLDivElement;

      const body = document.querySelector(
        `.${cls} .ant-table-tbody`,
      ) as HTMLDivElement;

      const _pagination = document.querySelector(
        `.${cls} .ant-pagination`,
      ) as HTMLDivElement;

      const simplePagination = document.querySelector(
        `.${cls} [class^='PaginationSimple']`,
      ) as HTMLDivElement;

      const summary = document.querySelector(
        `.${cls} .ant-table-summary`,
      ) as HTMLUListElement;

      const table = ref.current;

      const height = `${
        header?.offsetHeight +
        body?.offsetHeight +
        (summary ? summary?.offsetHeight : 0) +
        (pagination
          ? _pagination
            ? _pagination?.offsetHeight + 10
            : simplePagination
              ? simplePagination?.offsetHeight + 10
              : 0
          : 0) +
        (bordered ? 1 : 0) +
        (body?.offsetWidth > table.offsetWidth ? 5 : 0)
      }px`;

      if (scrollAutoHeight && !fillPanel) {
        table.style.height = height;

        if (
          (typeof scroll === "object" && scroll.y !== false) ||
          scroll === true
        ) {
          table.style.maxHeight = "100%";
        }
      }
    }
  }, [
    dataSource,
    fillPanel,
    cls,
    pagination,
    ref,
    scroll,
    scrollAutoHeight,
    ready,
    columns,
    bordered,
    virtual,
  ]);

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

export default useSetTableHeight;
