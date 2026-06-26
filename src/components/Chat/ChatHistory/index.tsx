import React, { useRef, useEffect, ReactNode } from "react";
import styles from "./index.module.less";
import { NewChatButton, HistoryGroup } from "./_components";

export interface ChatHistoryData {
  id: string;
  name: string;
  conversationId: string;
  [key: string]: unknown;
}

export interface ChatHistoryProps {
  historyList?: Record<string, ChatHistoryData[]>;
  updateTitle?: (chatId: string, title: string) => void;
  currentChatId?: string;
  deleteHistory?: (item?: ChatHistoryData) => void;
  onNewChat?: () => void;
  onChatItemClick?: (item: ChatHistoryData) => void;
  width?: string;
  onScrollEnd?: () => void;
  tools?: ReactNode;
}

const ChatHistory: React.FC<ChatHistoryProps> = (props) => {
  const {
    historyList,
    currentChatId,
    updateTitle,
    deleteHistory,
    onNewChat,
    onChatItemClick,
    width,
    onScrollEnd,
    tools,
  } = props;

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 滚动到底部处理
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer || !onScrollEnd) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      // 当滚动到底部时（允许 5px 的误差）
      if (scrollHeight - scrollTop - clientHeight < 5) {
        onScrollEnd();
      }
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
    };
  }, [onScrollEnd]);

  return (
    <div
      ref={scrollContainerRef}
      className={styles.historyContent}
      style={{ width }}
    >
      <NewChatButton onClick={onNewChat} />
      {tools && <div className={styles.tools}>{tools}</div>}
      {historyList && (
        <div className={styles.historyList}>
          {Object.keys(historyList)?.map((key) => (
            <HistoryGroup
              key={key}
              title={key}
              items={historyList[key]}
              currentChatId={currentChatId}
              updateTitle={updateTitle}
              deleteHistory={deleteHistory}
              onItemClick={onChatItemClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatHistory;
