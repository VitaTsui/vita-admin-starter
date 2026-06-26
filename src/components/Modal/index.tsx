import React from "react";
import { Modal as AntdModal, ModalProps as AntdModalProps } from "antd";
import styles from "./index.module.less";
import { useModalElements, useModalDrag } from "./_hooks";
import Button, { ButtonProps } from "../Button";

export interface ModalProps extends AntdModalProps {
  moveable?: boolean;
  edgeDetection?: boolean;
  full?: boolean;
  titleButtonGroup?: ButtonProps[];
}

const Modal: React.FC<ModalProps> = (props) => {
  const {
    moveable = true,
    className,
    classNames,
    open,
    onCancel,
    onOk,
    afterClose,
    edgeDetection = true,
    full = false,
    destroyOnClose = true,
    footer,
    title,
    titleButtonGroup,
    ...moadlConfig
  } = props;

  const {
    cls,
    modal,
    modalHeader,
    originalStyle,
    setModal,
    setModalHeader,
    setOriginalStyle,
  } = useModalElements({ open });

  useModalDrag({
    moveable,
    modal,
    modalHeader,
    open,
    edgeDetection,
  });

  const resetModal = () => {
    if (modal && originalStyle) {
      modal.setAttribute("style", originalStyle);
    }
  };

  const handleCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    onCancel?.(e);
  };

  const handleOk = (e: React.MouseEvent<HTMLButtonElement>) => {
    onOk?.(e);
  };

  return (
    <AntdModal
      centered
      {...moadlConfig}
      title={
        titleButtonGroup ? (
          <>
            {title}
            <div className={styles.titleButtonGroup}>
              {titleButtonGroup?.map((button, index) => (
                <Button key={index} {...button} />
              ))}
            </div>
          </>
        ) : (
          title
        )
      }
      destroyOnClose={destroyOnClose}
      open={open}
      onCancel={handleCancel}
      onOk={handleOk}
      className={`${styles.Modal} ${className} ${full ? styles.full : ""}`}
      classNames={{
        ...classNames,
        header: `${cls} ${styles.header} ${classNames?.header ?? ""} ${
          moveable ? styles.moveable : ""
        }`,
        content: `${styles.content} ${classNames?.content ?? ""}`,
        body: `${styles.body} ${classNames?.body ?? ""}`,
        footer: `${styles.footer} ${classNames?.footer ?? ""} ${
          footer === false ? styles.noFooter : ""
        }`,
      }}
      footer={footer}
      afterClose={() => {
        afterClose?.();
        resetModal();
        if (destroyOnClose) {
          setModal(null);
          setModalHeader(null);
          setOriginalStyle(null);
        }
      }}
    />
  );
};

export default Modal;
