import React from "react";
import { UploadFile } from "antd";
import Icon from "@/components/Icon";
import styles from "./index.module.less";

interface FileListProps {
  fileList: UploadFile[];
  onRemove: (uid: string) => void;
}

const FileList: React.FC<FileListProps> = ({ fileList, onRemove }) => {
  if (!fileList.length) return null;

  return (
    <div className={styles.fileList}>
      {fileList?.map((item) => (
        <div key={item.uid}>
          <span>{item.name}</span>
          <Icon
            icon="heroicons-outline:x"
            className={styles.close}
            onClick={() => onRemove(item.uid)}
          />
        </div>
      ))}
    </div>
  );
};

export default FileList;
