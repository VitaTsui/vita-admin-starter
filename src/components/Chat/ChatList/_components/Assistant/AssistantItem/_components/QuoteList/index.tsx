import React, { useEffect, useRef, useState } from "react";
import classNames from "classnames";
import Icon from "@/components/Icon";
import { useCalculateRowIndex, Quote } from "../../../../../_hooks";
import FilePreview, { FilePreviewType } from "@/components/FilePreview";
import { deepCopy, Equal } from "hsu-utils";
import styles from "./index.module.less";

interface QuoteListProps {
  retrieverResources?: Quote[];
}

const QuoteList: React.FC<QuoteListProps> = ({ retrieverResources }) => {
  const [showMore, setShowMore] = useState<boolean>(false);
  const [text, setText] = useState<string>("");
  const [fileType, setFileType] = useState<FilePreviewType>("");
  const containerRef = useRef<HTMLDivElement>(null);
  const [quoteList, setQuoteList] = useCalculateRowIndex(
    containerRef,
    deepCopy(retrieverResources ?? [])
  );
  const [lastQuoteList, setLastQuoteList] = useState<Quote[]>([]);

  useEffect(() => {
    if (!Equal.ObjEqual(lastQuoteList, retrieverResources ?? [])) {
      setQuoteList(deepCopy(retrieverResources ?? []));
      setLastQuoteList(deepCopy(retrieverResources ?? []));
    }
  }, [retrieverResources, lastQuoteList, setQuoteList]);

  if (!quoteList?.length) {
    return null;
  }

  return (
    <>
      <div className={styles.quoteList} ref={containerRef}>
        <div className={styles.quoteListTitle}>
          <Icon icon="gridicons:quote" className={styles.quoteIcon} />
          <span>引用</span>
          <hr />
          {!!quoteList.filter((i) => i.row !== 1).length && (
            <div
              className={classNames(styles.quoteListTitleIcon)}
              onClick={() => {
                setShowMore(!showMore);
              }}
            >
              <Icon
                icon={
                  showMore
                    ? "cuida:caret-up-outline"
                    : "cuida:caret-down-outline"
                }
              />
            </div>
          )}
        </div>
        <div
          className={classNames(styles.quoteListContent, {
            [styles.hide]:
              !!quoteList.filter((i) => i.row !== 1).length && !showMore,
          })}
        >
          {quoteList?.map((quoteItem, quoteIdx) => (
            <div
              key={quoteIdx}
              onClick={() => {
                const fileType =
                  quoteItem.documentName.split(".")[1] === "txt" ? "txt" : "md";
                setFileType(fileType);
                setText(quoteItem.content);
              }}
              className={classNames(styles.quoteListItem, {
                [styles.lastRow]: quoteItem.lastRow,
                [styles.lastRowIndex]: quoteItem.lastRowIndex,
              })}
            >
              {quoteItem.documentName}
            </div>
          ))}
        </div>
      </div>
      <FilePreview
        open={!!text}
        onClose={() => setText("")}
        text={text}
        fileType={fileType}
        className={styles.filePreview}
      />
    </>
  );
};

export default QuoteList;
