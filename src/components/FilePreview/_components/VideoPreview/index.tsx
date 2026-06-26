import React from "react";
import Icon from "@/components/Icon";
import classNames from "classnames";
import styles from "../BasePreview/index.module.less";

interface VideoPreviewProps {
  fileUrl?: string;
  onClose?: () => void;
  className?: string;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({
  fileUrl,
  onClose,
  className,
}) => {
  return (
    <div className={classNames(styles.BasePreview, className)}>
      <div className={styles.close} onClick={() => onClose?.()}>
        <Icon icon="ant-design:close-outlined" />
      </div>
      <video className={styles.video} controls>
        <source src={fileUrl} type="video/mp4" />
      </video>
    </div>
  );
};

export default VideoPreview;

