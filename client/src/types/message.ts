export interface Message {
  _id: string;
  sender: string;
  receiver: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface SendMessagePayload {
  receiverId: string;
  content: string;
}

export type SendMessageAck =
  | { success: true; message: Message }
  | { success: false; error: string };
