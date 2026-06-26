/**
 * 格式化聊天名称（截取省略号前的部分）
 */
export const formatChatName = (name: string): string => {
  return name.split("…")[0];
};

