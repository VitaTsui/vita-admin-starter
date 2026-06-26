import { useState } from "react";
import { FilePreviewType } from "../../FilePreview";

/**
 * 管理文件预览状态
 */
export function useUploadPreview() {
  const [file, setFile] = useState<{
    fileUrl?: string;
    fileType?: FilePreviewType;
    fileName?: string;
  }>({});

  return {
    file,
    setFile,
    open: !!file.fileUrl,
  };
}

