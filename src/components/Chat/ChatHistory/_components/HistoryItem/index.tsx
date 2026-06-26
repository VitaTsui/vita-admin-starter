import React, { useState, useEffect, useRef } from "react";
import classNames from "classnames";
import { Dropdown } from "antd";
import Icon from "@/components/Icon";
import Input from "@/components/Input";
import SecondConf from "@/components/SecondConf";
import styles from "./index.module.less";
import { ChatHistoryData } from "../..";
import { formatChatName } from "../../_utils";
import TextEllipsis from "@/components/TextEllipsis";

interface HistoryItemProps {
  item: ChatHistoryData;
  isActive: boolean;
  updateTitle?: (chatId: string, title: string) => void;
  deleteHistory?: (item?: ChatHistoryData) => void;
  onClick?: (item: ChatHistoryData) => void;
}

const HistoryItem: React.FC<HistoryItemProps> = ({
  item,
  isActive,
  updateTitle,
  deleteHistory,
  onClick,
}) => {
  // 重命名相关状态
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameTitle, setRenameTitle] = useState("");
  const [currentTitle, setCurrentTitle] = useState(formatChatName(item.name));
  // 用于跟踪是否刚刚完成重命名，避免立即被外部更新覆盖
  const justRenamedRef = useRef(false);

  // 删除确认弹窗状态
  const [deleteModal, setDeleteModal] = useState(false);

  // 初始化重命名标题
  useEffect(() => {
    if (isRenaming) {
      setRenameTitle(currentTitle);
    }
  }, [isRenaming, currentTitle]);

  // 同步 item.name 的变化到 currentTitle（仅在非重命名状态下）
  useEffect(() => {
    if (!isRenaming && !justRenamedRef.current) {
      const formattedName = formatChatName(item.name);
      setCurrentTitle(formattedName);
    }
    // 重置重命名标记
    if (justRenamedRef.current) {
      justRenamedRef.current = false;
    }
  }, [item.name, item.conversationId, isRenaming]);

  const handleRename = () => {
    setIsRenaming(true);
  };

  const handleRenameConfirm = () => {
    const newTitle = renameTitle.trim();
    if (newTitle && updateTitle) {
      updateTitle(item.conversationId, newTitle);
      // 先更新显示的标题，确保立即显示用户输入的名称
      setCurrentTitle(newTitle);
      // 标记刚刚完成重命名，避免立即被外部更新覆盖
      justRenamedRef.current = true;
    }
    setIsRenaming(false);
    setRenameTitle("");
  };

  const handleRenameCancel = () => {
    setIsRenaming(false);
    setRenameTitle("");
    setCurrentTitle(formatChatName(item.name));
  };

  const handleDelete = () => {
    setDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    setDeleteModal(false);
    deleteHistory?.(item);
  };

  const dropdownItems = [
    {
      key: "rename",
      label: (
        <span className={styles.dropdownItem}>
          <Icon icon="ri:pencil-line" />
          重命名
        </span>
      ),
      onClick: handleRename,
    },
    {
      key: "delete",
      label: (
        <span className={classNames(styles.dropdownItem, styles.delete)}>
          <Icon icon="ri:delete-bin-line" />
          删除
        </span>
      ),
      onClick: handleDelete,
    },
  ];

  if (isRenaming) {
    return (
      <Input
        className={styles.renameInput}
        onClick={(e) => e.stopPropagation()}
        value={renameTitle}
        onChange={(value) => setRenameTitle(value)}
        onBlur={handleRenameCancel}
        onPressEnter={handleRenameConfirm}
        autoFocus={true}
      />
    );
  }

  return (
    <>
      <div
        className={classNames(styles.historyItem, {
          [styles.active]: isActive,
        })}
        onClick={() => onClick?.(item)}
      >
        <TextEllipsis>{currentTitle}</TextEllipsis>

        <Dropdown
          menu={{
            items: dropdownItems,
            onClick: ({ domEvent }) => {
              domEvent.stopPropagation();
            },
          }}
          placement="bottomRight"
        >
          <div
            className={styles.operation}
            onClick={(e) => e.stopPropagation()}
          >
            <Icon icon="ri:more-fill" />
          </div>
        </Dropdown>
      </div>
      <SecondConf
        open={deleteModal}
        onCancel={() => setDeleteModal(false)}
        contentTitle="删除"
        contentText="删除后，该会话将无法恢复，请确认是否继续？"
        okButtonProps={{
          danger: true,
        }}
        onOk={handleDeleteConfirm}
        width={"40%"}
      />
    </>
  );
};

export default HistoryItem;
