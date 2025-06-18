interface Chat {
  chatId: string;
  connectionId: number;
  userId1: string;
  userId2: string;
  createdAt: number;
  updatedAt?: number;
};

interface Message {
  messageId: string;
  chatId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: number;
};

export {
    Chat,
    Message,
};