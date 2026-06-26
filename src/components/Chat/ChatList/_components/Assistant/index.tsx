import React, { ReactNode } from "react";
import styles from "./index.module.less";
import AssistantItem from "./AssistantItem";
import Icon from "@/components/Icon";
import classNames from "classnames";
import { AnswerMessage } from "../..";
import { useAssistantNavigation } from "../../_hooks";
import { Bubble } from "@ant-design/x";

interface AssistantProps {
  item: AnswerMessage[];
  assistanting?: boolean;
  onAgain?: () => void;
  hideTool?: boolean;
  onLikeChange?: (
    messageId: string,
    like: boolean | null,
    content: string
  ) => void;
  isLast?: boolean;
  className?: string;
  itemClassName?: string;
  assistantName?: string;
  assistantAvatar?: ReactNode;
  headerClassName?: string;
  noAnswerTip?: string;
}

const Assistant: React.FC<AssistantProps> = (props) => {
  const {
    item,
    assistanting,
    onAgain,
    hideTool,
    onLikeChange,
    isLast,
    className,
    itemClassName,
    assistantName,
    assistantAvatar,
    headerClassName,
    noAnswerTip,
  } = props;

  const {
    currentIndex,
    goPrev,
    goNext,
    isFirst,
    isLast: isLastItem,
  } = useAssistantNavigation({ itemLength: item.length });

  return (
    <div className={classNames(styles.Assistant, className)}>
      <Bubble
        header={
          assistantName ||
          item[currentIndex].time ||
          item[currentIndex].assistantName ? (
            <>
              {assistantName || item[currentIndex].assistantName}
              {item[currentIndex].time && (
                <div className={styles.time}>{item[currentIndex].time}</div>
              )}
            </>
          ) : undefined
        }
        avatar={assistantAvatar}
        classNames={{
          root: styles.bubbleRoot,
          body: styles.bubbleBody,
          header: classNames(styles.bubbleHeader, headerClassName),
          content: styles.bubbleContent,
        }}
        content={
          <div className={styles.contBox}>
            <AssistantItem
              className={itemClassName}
              item={item[currentIndex]}
              assistanting={currentIndex === item.length - 1 && assistanting}
              onAgain={onAgain}
              hideTool={hideTool}
              onLikeChange={onLikeChange}
              isLast={isLast}
              noAnswerTip={noAnswerTip}
            />
            {item.length > 1 && (
              <div className={styles.num}>
                <Icon
                  icon="mingcute:left-fill"
                  className={classNames(styles.icon, {
                    [styles.disabled]: isFirst,
                  })}
                  onClick={goPrev}
                />
                <div>
                  <span>{currentIndex + 1}</span>
                  <span>/</span>
                  <span>{item.length}</span>
                </div>
                <Icon
                  icon="mingcute:right-fill"
                  className={classNames(styles.icon, {
                    [styles.disabled]: isLastItem,
                  })}
                  onClick={goNext}
                />
              </div>
            )}
          </div>
        }
      />
    </div>
  );
};

export default Assistant;
