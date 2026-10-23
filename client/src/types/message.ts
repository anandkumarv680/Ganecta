export interface MessageUser {
  _id: string;
  name: string;
  username: string;
  profilePicture?: string;
}

export interface Message {
  _id: string;
  sender: string | MessageUser;
  receiver: string | MessageUser;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  user: MessageUser;
  lastMessage: string;
  lastMessageAt: string;
}

export interface ChatHistoryResponse {
  messages: Message[];
  hasMore: boolean;
}

export interface SendMessagePayload {
  receiverId: string;
  content: string;
}

export type SendMessageAck =
  | { success: true; message: Message }
  | { success: false; error: string };
