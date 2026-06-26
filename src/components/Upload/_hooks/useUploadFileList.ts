import { useEffect, useState } from "react";
import { UploadFile } from "antd";
import { deepCopy, Equal } from "hsu-utils";
import { extractFileUrl } from "../_utils";

interface UseUploadFileListProps {
  fileList?: UploadFile[];
  onChange?: (params: { file: UploadFile; fileList: UploadFile[] }) => void;
  rmFile?: string;
}

/**
 * 管理上传文件列表状态
 */
export function useUploadFileList({
  fileList,
  onChange,
  rmFile,
}: UseUploadFileListProps) {
  const [_fileList, setFilelist] = useState<UploadFile[]>([]);
  const [lastFileList, setLastFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    if (rmFile) {
      const file = _fileList.find((item) => item.uid === rmFile);
      const filteredList = _fileList.filter((item) => item.uid !== rmFile);
      if (file) {
        setFilelist(filteredList);
        setTimeout(() => {
          onChange?.({
            file,
            fileList: filteredList,
          });
        }, 100);
      }
    }
  }, [_fileList, onChange, rmFile]);

  useEffect(() => {
    if (!Equal.ObjEqual(fileList ?? [], lastFileList)) {
      if (fileList?.length) {
        setFilelist(deepCopy(fileList));
        setLastFileList(deepCopy(fileList));
      } else {
        setFilelist([]);
        setLastFileList([]);
      }
    }
  }, [fileList, lastFileList]);

  const handleChange = ({
    file,
    fileList: newFileList,
  }: {
    file: UploadFile;
    fileList: UploadFile[];
  }) => {
    setFilelist(newFileList);

    const uploaded = newFileList.filter((item) => item.status !== "uploading");
    if (uploaded.length) {
      const processedList = uploaded
        .filter((item) => item?.response?.code !== "ERR_CANCELED")
        ?.map((item) => extractFileUrl(item));

      onChange?.({
        file,
        fileList: processedList,
      });
      setLastFileList(processedList);
    }
  };

  return {
    fileList: _fileList,
    setFileList: setFilelist,
    onChange: handleChange,
  };
}
