import { CachedBaseClient  } from "@/storage/cached_base_client";
import { Chat, Message } from "@/models/chats";

interface CachedChatsClient extends CachedBaseClient {
    getChatByConnectionId(connectionId: string): Promise<Chat | null>
    getChatByChatId(chatId: string): Promise<Chat | null>;
    getChatsByUserId(userId: string, updatedAfter?: number, desc?: boolean): Promise<Chat[]>;
    upsertChats(chats: Chat[]): Promise<void>;
    deleteChat(chatId: string): Promise<void>;
    deleteChatByConnectionId(connectionId: number): Promise<void>;
    deleteAllChats(): Promise<void>;
    getMessagesByChatId(chatId: string, createdAfter?: number, limit?: number, offset?: number, desc?: boolean): Promise<Message[]>;
    getMessagesByUserId(userId: string, createdAfter?: number, limit?: number, offset?: number, desc?: boolean): Promise<Message[]>;
    getMessagesByConnectionId(connectionId: string, createdAfter?: number, limit?: number, offset?: number, desc?: boolean): Promise<Message[]>;
    upsertMessages(messages: Message[]): Promise<void>;
};

export {
    CachedChatsClient
};