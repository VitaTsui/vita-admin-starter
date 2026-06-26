import { deepCopy, Equal, get_string_size } from "hsu-utils";
import { RefObject, useEffect, useState } from "react";

export interface Quote {
  documentName: string;
  content: string;
  row?: number;
  rowIndex?: number;
  position: number;
  lastRow?: boolean;
  lastRowIndex?: boolean;
}

export interface Font {
  family: string;
  size: number;
  weight: string;
}

export interface RowIndex {
  row: number;
  position: number;
  lastRow?: boolean;
  lastRowIndex?: boolean;
}

export default function useCalculateRowIndex(
  containerRef: RefObject<HTMLDivElement>,
  quoteList: Quote[],
  font: Font = {
    family:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
    size: 12,
    weight: "400",
  },
  padding: number = 8,
  gap: number = 8
): [Quote[], (quoteList: Quote[]) => void] {
  const [_quoteList, setQuoteList] = useState<Quote[]>(quoteList);

  useEffect(() => {
    const calculateRowIndex = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;

        const rowIndices: Record<string, RowIndex> = {};

        let currentRow = 1;
        let currentRowIndex = 1;
        let currentRowWidth = 0;

        const __quoteList = deepCopy(_quoteList);

        __quoteList?.forEach((quote, quoteIdx) => {
          const textSize = get_string_size(quote.documentName, font);
          const elementWidth = Math.ceil(textSize.width + padding * 2);
          const nextElementWidth = __quoteList[quoteIdx + 1]?.documentName
            ? Math.ceil(
                get_string_size(
                  __quoteList[quoteIdx + 1]?.documentName ?? "",
                  font
                ).width +
                  padding * 2
              )
            : 0;

          if (currentRowWidth + elementWidth > containerWidth) {
            currentRow++;
            currentRowWidth = 0;
            currentRowIndex = 1;
            rowIndices[quote.position] = {
              row: currentRow,
              position: currentRowIndex,
            };
          } else {
            rowIndices[quote.position] = {
              row: currentRow,
              position: currentRowIndex,
              lastRowIndex:
                currentRowWidth + elementWidth + gap + nextElementWidth >
                containerWidth,
            };
          }

          if (quoteIdx === __quoteList.length - 1) {
            rowIndices[quote.position].lastRow = true;
            rowIndices[quote.position].lastRowIndex = true;

            Object.keys(rowIndices)?.forEach((key) => {
              const _d = rowIndices[key];

              if (_d.row === currentRow) {
                _d.lastRow = true;
              } else {
                _d.lastRow = false;
              }
            });
          } else {
            currentRowWidth += elementWidth + gap;
            currentRowIndex++;
          }
        });

        __quoteList?.forEach((quote) => {
          quote.row = rowIndices[quote.position]?.row;
          quote.rowIndex = rowIndices[quote.position]?.position;
          quote.lastRow = rowIndices[quote.position]?.lastRow;
          quote.lastRowIndex = rowIndices[quote.position]?.lastRowIndex;
        });

        if (!Equal.ObjEqual(_quoteList, __quoteList)) {
          setQuoteList(__quoteList);
        }
      }
    };

    calculateRowIndex();

    // 添加窗口大小调整监听器
    window.addEventListener("resize", calculateRowIndex);

    return () => {
      window.removeEventListener("resize", calculateRowIndex);
    };
  }, [_quoteList, containerRef, font, gap, padding, quoteList]);

  return [_quoteList, setQuoteList];
}
