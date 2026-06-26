import React from "react";
import styles from "./index.module.less";
import Icon from "@/components/Icon";

interface NewChatButtonProps {
  onClick?: () => void;
}

const NewChatButton: React.FC<NewChatButtonProps> = ({ onClick }) => {
  return (
    <div className={styles.newChatContainer}>
      <div className={styles.newChat} onClick={onClick}>
        <Icon icon="lets-icons:chat-alt-add" fontSize={18} />
        <span>新对话</span>
      </div>
    </div>
  );
};

export default NewChatButton;
