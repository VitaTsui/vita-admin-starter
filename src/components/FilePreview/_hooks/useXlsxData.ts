import { useEffect, useState } from "react";
import { read, WorkBook } from "xlsx";

interface UseXlsxDataProps {
  fileType?: string;
  fileUrl?: string;
}

/**
 * 加载并解析 xlsx 文件
 */
export function useXlsxData({ fileType, fileUrl }: UseXlsxDataProps) {
  const [xlsxData, setXlsxData] = useState<WorkBook | undefined>(undefined);

  useEffect(() => {
    if (fileType === "xlsx" && fileUrl) {
      fetch(fileUrl)
        .then((res) => res.arrayBuffer())
        .then((buffer) => {
          const workbook = read(buffer);
          setXlsxData(workbook);
        });
    }
  }, [fileType, fileUrl]);

  return xlsxData;
}
