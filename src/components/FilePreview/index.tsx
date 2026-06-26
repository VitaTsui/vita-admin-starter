import React from "react";
import PdfPreview from "./_components/PdfPreview";
import VideoPreview from "./_components/VideoPreview";
import TextPreview from "./_components/TextPreview";
import MarkdownPreview from "./_components/MarkdownPreview";
import ImagePreview from "./_components/ImagePreview";
import XlsxPreview from "./_components/XlsxPreview";
import { useXlsxData } from "./_hooks";
import { FilePreviewType, FilePreviewTypeArr } from "./_utils";

export type { FilePreviewType };
export { FilePreviewTypeArr };

interface FilePreviewProps {
  fileUrl?: string;
  fileType?: FilePreviewType;
  fileName?: string;
  open?: boolean;
  onClose?: () => void;
  text?: string;
  className?: string;
  pagination?: boolean;
}

const FilePreview: React.FC<FilePreviewProps> = (props) => {
  const { fileUrl, fileType, open, onClose, text, className, pagination } =
    props;
  const xlsxData = useXlsxData({ fileType, fileUrl });

  if (!open) {
    return null;
  }

  switch (fileType) {
    case "mp4": {
      return (
        <VideoPreview
          fileUrl={fileUrl}
          onClose={onClose}
          className={className}
        />
      );
    }
    case "pdf": {
      return (
        <PdfPreview
          fileUrl={fileUrl}
          open={open}
          onClose={onClose}
          className={className}
          pagination={pagination}
        />
      );
    }
    case "jpg":
    case "jpeg":
    case "png":
    case "gif": {
      return (
        <ImagePreview
          fileUrl={fileUrl}
          onClose={onClose}
          className={className}
        />
      );
    }
    case "txt": {
      return (
        <TextPreview text={text} onClose={onClose} className={className} />
      );
    }
    case "md": {
      return (
        <MarkdownPreview text={text} onClose={onClose} className={className} />
      );
    }
    case "xlsx": {
      return (
        <XlsxPreview
          xlsxData={xlsxData}
          onClose={onClose}
          className={className}
        />
      );
    }
    default: {
      return null;
    }
  }
};

export default FilePreview;
