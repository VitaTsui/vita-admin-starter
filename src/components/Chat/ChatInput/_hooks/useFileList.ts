import { useEffect, useState } from "react";
import { UploadFile } from "antd";
import { Equal } from "hsu-utils";

export const useFileList = (fileList?: UploadFile[]) => {
  const [internalFileList, setInternalFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    if (Equal.ObjEqual(fileList || [], internalFileList)) return;
    setInternalFileList(fileList || []);
  }, [fileList, internalFileList]);

  return {
    fileList: internalFileList,
    setFileList: setInternalFileList,
  };
};

