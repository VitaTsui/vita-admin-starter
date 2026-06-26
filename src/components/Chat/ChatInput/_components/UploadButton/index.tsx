import React, { useState } from "react";
import { Tooltip, UploadFile } from "antd";
import Icon from "@/components/Icon";
import Upload from "@/components/Upload";
import styles from "./index.module.less";
import { validateFileSize, processFileList } from "../../_utils";
import Button from "@/components/Button";

interface UploadButtonProps {
  onFileListChange?: (fileList: UploadFile[]) => void;
  fileList: UploadFile[];
  uploadConfig?: {
    action?: string;
    accept?: string;
    size?: number;
    data?: Record<string, string>;
  };
  onUploadingChange?: (isUploading: boolean) => void;
  // 拦截点击事件
  onInterceptClick?: (e: React.MouseEvent<HTMLSpanElement>) => void;
}

const UploadButton: React.FC<UploadButtonProps> = (props) => {
  const {
    onFileListChange,
    fileList,
    uploadConfig = {},
    onUploadingChange,
    onInterceptClick,
  } = props;
  const [isUpload, setIsUpload] = useState<boolean>(false);

  const {
    action,
    accept = ".pdf,.txt,.csv,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.md,.html,.json,.xml,.yaml,.yml,.toml,.ini,.log,.css,.js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.h,.hpp,.sh,.bat,.ps1,.sql,.properties,.conf,.config,.rtf",
    size = 20,
    data,
  } = uploadConfig;

  return (
    <Tooltip title="上传文件">
      <li>
        <Upload
          action={action}
          accept={accept}
          multiple={true}
          fileList={fileList}
          data={data}
          disabled={isUpload}
          listType="text"
          size={size}
          beforeUpload={(file) => {
            return validateFileSize(file, size);
          }}
          onChange={({ fileList: newFileList }) => {
            const processedList = processFileList(newFileList);
            onFileListChange?.(processedList);
          }}
          onUploadingList={(list) => {
            const uploading = Object.keys(list).length > 0;
            setIsUpload(uploading);
            onUploadingChange?.(uploading);
          }}
          showUploadList={false}
        >
          <Button
            className={styles.clip}
            icon={
              <Icon
                icon={
                  isUpload
                    ? "eos-icons:loading"
                    : "heroicons-outline:paper-clip"
                }
                fontSize={22}
                color="#ababab"
              />
            }
            onClick={
              onInterceptClick
                ? (e) => {
                    e.stopPropagation();
                    onInterceptClick(e);
                  }
                : undefined
            }
          />
        </Upload>
      </li>
    </Tooltip>
  );
};

export default UploadButton;
