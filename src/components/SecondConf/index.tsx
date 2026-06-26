import React, { ReactNode } from "react";
import styles from "./index.module.less";
import Icon from "../Icon";
import Modal, { ModalProps } from "../Modal";

interface SecondConfProps extends Omit<ModalProps, "title"> {
  contentTitle?: ReactNode;
  contentText?: ReactNode;
}

const SecondConf: React.FC<SecondConfProps> = (props) => {
  const { classNames, contentTitle, contentText, ...modalConfig } = props;

  return (
    <Modal
      width={800}
      {...modalConfig}
      centered
      className={styles.SecondConf}
      classNames={{
        body: `${styles.body} ${classNames?.body || ""}`,
        ...classNames,
      }}
      maskClosable={false}
      mask={false}
      title=" "
    >
      <Icon icon="mingcute:question-line" className={styles.icon} />
      <div className={styles.content}>
        <div className={styles.title}>确认{contentTitle}吗？</div>
        <div className={styles.text}>{contentText}</div>
      </div>
    </Modal>
  );
};

export default SecondConf;
