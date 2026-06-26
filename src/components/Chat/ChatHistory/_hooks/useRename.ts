import { useState } from "react";

export const useRename = (
  updateTitle?: (chatId: string, title: string) => void
) => {
  const [renamingChatId, setRenamingChatId] = useState<string | null>(null);
  const [title, setTitle] = useState("");

  const handleRename = (chatId: string, currentName: string) => {
    setRenamingChatId(chatId);
    setTitle(currentName);
  };

  const handleRenameConfirm = (chatId: string) => {
    setRenamingChatId(null);
    setTitle("");
    updateTitle?.(chatId, title);
  };

  const handleRenameCancel = () => {
    setRenamingChatId(null);
    setTitle("");
  };

  return {
    renamingChatId,
    title,
    setTitle,
    handleRename,
    handleRenameConfirm,
    handleRenameCancel,
  };
};
