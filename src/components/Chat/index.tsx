import ChatList from "./ChatList";
import ChatHistory from "./ChatHistory";
import ChatInput from "./ChatInput";

export type {
  ChatMessage,
  QueryMessage,
  AnswerMessage,
  RetrieverResource,
  ChatListProps,
} from "./ChatList";
export type { ChatHistoryProps, ChatHistoryData } from "./ChatHistory";
export type {
  ChatInputProps,
  ModelConfig,
  AgentConfig,
  AgentToggleConfig,
} from "./ChatInput";

interface ChatType {
  List: typeof ChatList;
  History: typeof ChatHistory;
  Input: typeof ChatInput;
}

const Chat: ChatType = {
  List: ChatList,
  History: ChatHistory,
  Input: ChatInput,
};

export default Chat;
