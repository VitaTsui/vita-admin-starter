import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./index.module.less";
import XSpreadsheet, { Options } from "x-data-spreadsheet";
import { Equal, generateRandomStr } from "hsu-utils";
import "x-data-spreadsheet/dist/xspreadsheet.css";
import classNames from "classnames";
import { WorkBook } from "xlsx";
import { stox } from "./xlsxspread";

interface XOptions extends Omit<Options, "view"> {
  showBottomTool?: boolean;
}

interface SpreadsheetProps {
  data?: WorkBook;
  xOptions?: XOptions;
  className?: string;
}

const Spreadsheet: React.FC<SpreadsheetProps> = (props) => {
  const { data, xOptions = {}, className } = props;
  const { showBottomTool = true, ...xOptionsRest } = xOptions;
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const id = useMemo(() => generateRandomStr(10), []);
  const [sheet, setSheet] = useState<XSpreadsheet | null>(null);
  const [lastData, setLastData] = useState<WorkBook | undefined>(undefined);

  useEffect(() => {
    if (ref.current && containerRef.current && !sheet) {
      const _sheet = new XSpreadsheet(`#${id}`, {
        view: ref.current
          ? {
              width: () => ref.current!.clientWidth,
              height: () => ref.current!.clientHeight,
            }
          : undefined,
        ...xOptionsRest,
      });

      setSheet(_sheet);
    }
  }, [id, xOptionsRest, sheet]);

  useEffect(() => {
    if (sheet && data && !Equal.ObjEqual(data, lastData)) {
      sheet.loadData(stox(data));
      setLastData(data);
    }
  }, [sheet, data, lastData]);

  return (
    <div
      className={classNames(styles.spreadsheet, className, {
        [styles.showBottomTool]: showBottomTool,
      })}
      ref={ref}
    >
      <div id={id} ref={containerRef} />
    </div>
  );
};

export default Spreadsheet;
