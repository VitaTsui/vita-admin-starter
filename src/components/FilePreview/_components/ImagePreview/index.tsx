import React from "react";
import { Image } from "antd";

interface ImagePreviewProps {
  fileUrl?: string;
  onClose?: () => void;
  className?: string;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  fileUrl,
  onClose,
  className,
}) => {
  return (
    <Image
      wrapperStyle={{ display: "none" }}
      preview={{
        visible: true,
        onVisibleChange: (visible) => !visible && onClose?.(),
        afterOpenChange: (visible) => !visible && onClose?.(),
      }}
      src={fileUrl}
      className={className}
    />
  );
};

export default ImagePreview;

