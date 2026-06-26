import React from "react";
import styles from "./index.module.less";
import { ChatHistoryData } from "../..";
import HistoryItem from "../HistoryItem";

interface HistoryGroupProps {
  title: string;
  items: ChatHistoryData[];
  currentChatId?: string;
  updateTitle?: (chatId: string, title: string) => void;
  deleteHistory?: (item?: ChatHistoryData) => void;
  onItemClick?: (item: ChatHistoryData) => void;
}

const HistoryGroup: React.FC<HistoryGroupProps> = ({
  title,
  items,
  currentChatId,
  updateTitle,
  deleteHistory,
  onItemClick,
}) => {
  return (
    <div className={styles.historyGroup}>
      <div className={styles.historyGroupTitle}>{title}</div>
      <div className={styles.historyGroupContent}>
        {items?.map((item) => (
          <HistoryItem
            key={item.conversationId || item.id}
            item={item}
            isActive={currentChatId === item.conversationId}
            updateTitle={updateTitle}
            deleteHistory={deleteHistory}
            onClick={onItemClick}
          />
        ))}
      </div>
    </div>
  );
};

export default HistoryGroup;
