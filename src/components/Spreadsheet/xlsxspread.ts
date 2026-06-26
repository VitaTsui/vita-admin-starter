import * as XLSX from "xlsx";

// 定义类型接口
interface CellData {
  text: string;
  merge?: [number, number];
}

interface RowData {
  cells: { [key: number]: CellData };
}

interface SheetData {
  name: string;
  rows: { [key: number]: RowData };
  merges: string[];
}

interface XSpreadsheetData {
  name: string;
  rows: {
    len: number;
    [key: number]: {
      cells: { [key: string]: CellData };
    };
  };
}

interface Coordinate {
  r: number;
  c: number;
}

export function stox(wb: XLSX.WorkBook): SheetData[] {
  const out: SheetData[] = [];
  wb.SheetNames?.forEach(function (name) {
    const o: SheetData = { name: name, rows: {}, merges: [] };
    const ws = wb.Sheets[name];

    // 检查 ws["!ref"] 是否存在
    if (!ws["!ref"]) {
      out.push(o);
      return;
    }

    const range = XLSX.utils.decode_range(ws["!ref"]);
    // sheet_to_json will lost empty row and col at begin as default
    range.s = { r: 0, c: 0 };
    const aoa = XLSX.utils.sheet_to_json(ws, {
      raw: false,
      header: 1,
      range: range,
    }) as unknown[][];

    aoa?.forEach(function (r: unknown[], i: number) {
      const cells: { [key: number]: CellData } = {};
      r?.forEach(function (c: unknown, j: number) {
        cells[j] = { text: String(c || "") };

        const cellRef = XLSX.utils.encode_cell({ r: i, c: j });

        if (ws[cellRef] != null && ws[cellRef].f != null) {
          cells[j].text = "=" + ws[cellRef].f;
        }
      });
      o.rows[i] = { cells: cells };
    });

    o.merges = [];
    (ws["!merges"] || [])?.forEach(function (merge: XLSX.Range, i: number) {
      //Needed to support merged cells with empty content
      if (o.rows[merge.s.r] == null) {
        o.rows[merge.s.r] = { cells: {} };
      }
      if (o.rows[merge.s.r].cells[merge.s.c] == null) {
        o.rows[merge.s.r].cells[merge.s.c] = { text: "" };
      }

      o.rows[merge.s.r].cells[merge.s.c].merge = [
        merge.e.r - merge.s.r,
        merge.e.c - merge.s.c,
      ];

      o.merges[i] = XLSX.utils.encode_range(merge);
    });

    out.push(o);
  });

  return out;
}

/**
 * Converts data from x-spreadsheet to SheetJS
 *
 * @param  {XSpreadsheetData[]} sdata An x-spreadsheet data object
 *
 * @returns {XLSX.WorkBook} A SheetJS workbook object
 */
export function xtos(sdata: XSpreadsheetData[]): XLSX.WorkBook {
  const out = XLSX.utils.book_new();
  sdata?.forEach(function (xws: XSpreadsheetData) {
    const ws: XLSX.WorkSheet = {} as XLSX.WorkSheet;
    const rowobj = xws.rows;
    for (let ri = 0; ri < rowobj.len; ++ri) {
      const row = rowobj[ri];
      if (!row) continue;

      let minCoord: Coordinate | undefined, maxCoord: Coordinate | undefined;
      Object.keys(row.cells)?.forEach(function (k: string) {
        const idx = +k;
        if (isNaN(idx)) return;

        const lastRef = XLSX.utils.encode_cell({ r: ri, c: idx });
        if (minCoord == null) {
          minCoord = { r: ri, c: idx };
        } else {
          if (ri < minCoord.r) minCoord.r = ri;
          if (idx < minCoord.c) minCoord.c = idx;
        }
        if (maxCoord == undefined) {
          maxCoord = { r: ri, c: idx };
        } else {
          if (ri > maxCoord.r) maxCoord.r = ri;
          if (idx > maxCoord.c) maxCoord.c = idx;
        }

        let cellText: string | number | boolean = row.cells[k].text || "";
        let type = "s";
        if (!cellText) {
          cellText = "";
          type = "z";
        } else if (
          typeof cellText === "string" &&
          !isNaN(parseFloat(cellText))
        ) {
          cellText = parseFloat(cellText);
          type = "n";
        } else if (
          typeof cellText === "string" &&
          (cellText.toLowerCase() === "true" ||
            cellText.toLowerCase() === "false")
        ) {
          cellText = cellText.toLowerCase() === "true";
          type = "b";
        }

        ws[lastRef] = { v: cellText, t: type };

        if (type == "s" && typeof cellText === "string" && cellText[0] == "=") {
          ws[lastRef].f = cellText.slice(1);
        }

        if (row.cells[k].merge != null) {
          if (ws["!merges"] == null) ws["!merges"] = [];

          ws["!merges"].push({
            s: { r: ri, c: idx },
            e: {
              r: ri + (row.cells[k].merge?.[0] || 0),
              c: idx + (row.cells[k].merge?.[1] || 0),
            },
          });
        }
      });

      if (minCoord && maxCoord) {
        ws["!ref"] = XLSX.utils.encode_range({
          s: { r: minCoord.r, c: minCoord.c },
          e: { r: maxCoord.r, c: maxCoord.c },
        });
      }
    }

    XLSX.utils.book_append_sheet(out, ws, xws.name);
  });

  return out;
}
