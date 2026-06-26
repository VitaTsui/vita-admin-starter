import React from "react";
import Icon from "@/components/Icon";
import Spreadsheet from "@/components/Spreadsheet";
import { WorkBook } from "xlsx";
import classNames from "classnames";
import styles from "../BasePreview/index.module.less";

interface XlsxPreviewProps {
  xlsxData?: WorkBook;
  onClose?: () => void;
  className?: string;
}

const XlsxPreview: React.FC<XlsxPreviewProps> = ({
  xlsxData,
  onClose,
  className,
}) => {
  return (
    <div className={classNames(styles.BasePreview, className)}>
      <div className={styles.close} onClick={() => onClose?.()}>
        <Icon icon="ant-design:close-outlined" />
      </div>
      <div className={styles.text}>
        <Spreadsheet
          data={xlsxData}
          xOptions={{
            showToolbar: false,
            showContextmenu: false,
            showBottomTool: false,
            mode: "read",
          }}
        />
      </div>
    </div>
  );
};

export default XlsxPreview;

