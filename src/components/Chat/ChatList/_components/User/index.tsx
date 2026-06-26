import React, { ReactNode } from "react";
import Markdown from "@/components/Markdown";
import { Tooltip } from "antd";
import styles from "./index.module.less";
import Copy from "@/components/Copy";
import { QueryMessage } from "../..";
import classNames from "classnames";
import { Bubble } from "@ant-design/x";

interface UserProps {
  item: QueryMessage;
  hideTool?: boolean;
  className?: string;
  userName?: string;
  userAvatar?: ReactNode;
  renderContent?: (originContent: ReactNode, item: QueryMessage) => ReactNode;
  renderQuery?: (
    query: string | undefined,
    item: QueryMessage
  ) => string | undefined;
  headerClassName?: string;
}

const User: React.FC<UserProps> = (props) => {
  const {
    item,
    hideTool,
    className,
    userName,
    userAvatar,
    renderContent,
    renderQuery,
    headerClassName,
  } = props;

  const content = (
    <div className={styles.content}>
      {!!item.messageFiles?.length && (
        <div className={styles.fileList}>
          {item.messageFiles?.map((file) => (
            <div key={file.id} className={styles.file}>
              <div className={styles.fileName}>{file.filename || file.id}</div>
            </div>
          ))}
        </div>
      )}
      <div id={`${item.messageId}-query`}>
        <Markdown.Views>
          {renderQuery ? renderQuery(item.query, item) : item.query}
        </Markdown.Views>
      </div>
      {!hideTool && (
        <div className={styles.userTool}>
          <Tooltip placement="top" title="复制">
            <Copy id={`${item.messageId}-query`} text="" />
          </Tooltip>
        </div>
      )}
    </div>
  );

  return (
    <div className={classNames(styles.User, className)}>
      <Bubble
        placement="end"
        header={
          userName || item.userName || item.time ? (
            <>
              {userName || item.userName}
              {item.time && <div className={styles.time}>{item.time}</div>}
            </>
          ) : undefined
        }
        avatar={userAvatar}
        classNames={{
          root: styles.bubbleRoot,
          body: styles.bubbleBody,
          header: classNames(styles.bubbleHeader, headerClassName),
          content: styles.bubbleContent,
        }}
        content={renderContent ? renderContent(content, item) : content}
      />
    </div>
  );
};

export default User;
