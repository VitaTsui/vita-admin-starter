import React, { useState, useEffect, useRef } from "react";
import styles from "./index.module.less";
import classNames from "classnames";
import Markdown from "@/components/Markdown";
import { AnswerMessage } from "../../..";
import { cleanRedactedReasoning } from "../../../_utils";
import { Bubble, Think } from "@ant-design/x";
import Copy from "./_components/Copy";
import QuoteList from "./_components/QuoteList";
import LikeDislike from "./_components/LikeDislike";

interface AssistantItemProps {
  item: AnswerMessage;
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
  noAnswerTip?: string;
}

const AssistantItem: React.FC<AssistantItemProps> = (props) => {
  const { item, assistanting, hideTool, onLikeChange, className, noAnswerTip } =
    props;
  const cleanedThink = item?.think ? cleanRedactedReasoning(item.think) : "";
  const cleanedAnswer = item?.answer ? cleanRedactedReasoning(item.answer) : "";
  const [expanded, setExpanded] = useState(false);
  const prevThinkingRef = useRef(false);

  // 判断是否正在思考中
  const isThinking = !item?.think?.endsWith("</think>") && !!assistanting;

  // 判断是否有思考内容（排除空标签和标签本身）
  const hasThink = cleanedThink && cleanedThink.trim().length > 0;

  // 当开始思考时，自动展开；思考结束时，自动收起
  useEffect(() => {
    if (isThinking && !prevThinkingRef.current) {
      // 从非思考状态变为思考状态：展开
      setExpanded(true);
    } else if (!isThinking && prevThinkingRef.current) {
      // 从思考状态变为非思考状态：收起
      setExpanded(false);
    }
    prevThinkingRef.current = isThinking;
  }, [isThinking]);

  return (
    <>
      <div className={classNames(styles.AssistantItem, className)}>
        {!!cleanedThink && (
          <Think
            title={isThinking ? "思考中..." : "已深度思考"}
            loading={!item?.think?.endsWith("</think>")}
            classNames={{
              content: styles.thinkContent,
            }}
            expanded={expanded}
            onExpand={(v) => setExpanded(v)}
          >
            <Markdown.Views className={styles.thinkContentMarkdown}>
              {cleanedThink}
            </Markdown.Views>
          </Think>
        )}
        {!item.error && (
          <Bubble
            loading={!cleanedThink && !cleanedAnswer && assistanting}
            classNames={{
              root: styles.answerBubble,
              content: styles.answerContent,
            }}
            content={cleanedAnswer}
            streaming={!!cleanedAnswer && assistanting}
            contentRender={(content) => {
              return (
                <div id={`${item.messageId}-answer`}>
                  <Markdown.Views>{content}</Markdown.Views>
                </div>
              );
            }}
          />
        )}
        {item.error && <div className={styles.error}>{item.error}</div>}
        {/* 无法回答的提示 */}
        {!hasThink &&
          !cleanedAnswer &&
          !assistanting &&
          !item.error &&
          !!noAnswerTip && (
            <div id={`${item.messageId}-answer`} className={styles.noAnswerTip}>
              <Markdown.Views>{noAnswerTip}</Markdown.Views>
            </div>
          )}
        <QuoteList retrieverResources={item?.retrieverResources} />
        {!assistanting && !hideTool && (
          <div className={styles.assistantTool}>
            {cleanedAnswer && (
              <>
                <Copy content={cleanedAnswer} />
                <LikeDislike
                  messageId={item.messageId}
                  initialLike={item.like}
                  onLikeChange={onLikeChange}
                />
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default AssistantItem;
