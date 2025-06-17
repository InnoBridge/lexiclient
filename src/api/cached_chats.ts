import { cacheClient } from "@/api/cache";
import { Chat, Message } from "@/models/chats";

const getChatByConnectionId = async (connectionId: string): Promise<Chat | null> => {
    if (!cacheClient) {
        throw new Error("Cache client not initialized. Call initializeCache first.");
    }
    return await cacheClient.getChatByConnectionId(connectionId);
};

const getChatByChatId = async (chatId: string): Promise<Chat | null> => {
    if (!cacheClient) {
        throw new Error("Cache client not initialized. Call initializeCache first.");
    }
    return await cacheClient.getChatByChatId(chatId);
};

const getChatsByUserId = async (userId: string, updatedAfter?: number, desc: boolean = true): Promise<Chat[]> => {
    if (!cacheClient) {
        throw new Error("Cache client not initialized. Call initializeCache first.");
    }
    return await cacheClient.getChatsByUserId(userId, updatedAfter, desc);
};

const upsertChats = async (chats: Chat[]): Promise<void> => {
    if (!cacheClient) {
        throw new Error("Cache client not initialized. Call initializeCache first.");
    }
    return await cacheClient.upsertChats(chats);
};

const deleteChat = async (chatId: string): Promise<void> => {
    if (!cacheClient) {
        throw new Error("Cache client not initialized. Call initializeCache first.");
    }
    return await cacheClient.deleteChat(chatId);
};

const deleteChatByConnectionId = async (connectionId: number): Promise<void> => {
    if (!cacheClient) {
        throw new Error("Cache client not initialized. Call initializeCache first.");
    }
    return await cacheClient.deleteChatByConnectionId(connectionId);
};

const deleteAllChats = async (): Promise<void> => {
    if (!cacheClient) {
        throw new Error("Cache client not initialized. Call initializeCache first.");
    }
    return await cacheClient.deleteAllChats();
};

const getMessagesByChatId = async (chatId: string, createdAfter?: number, limit?: number, offset?: number, desc: boolean = true): Promise<Message[]> => {
    if (!cacheClient) {
        throw new Error("Cache client not initialized. Call initializeCache first.");
    }
    return await cacheClient.getMessagesByChatId(chatId, createdAfter, limit, offset, desc);
};

const getMessagesByUserId = async (userId: string, createdAfter?: number, limit?: number, offset?: number, desc: boolean = true): Promise<Message[]> => {
    if (!cacheClient) {
        throw new Error("Cache client not initialized. Call initializeCache first.");
    }
    return await cacheClient.getMessagesByUserId(userId, createdAfter, limit, offset, desc);
};

const getMessagesByConnectionId = async (connectionId: string, createdAfter?: number, limit?: number, offset?: number, desc: boolean = true): Promise<Message[]> => {
    if (!cacheClient) {
        throw new Error("Cache client not initialized. Call initializeCache first.");
    }
    return await cacheClient.getMessagesByConnectionId(connectionId, createdAfter, limit, offset, desc);
};

const upsertMessages = async (messages: Message[]): Promise<void> => {
    if (!cacheClient) {
        throw new Error("Cache client not initialized. Call initializeCache first.");
    }
    return await cacheClient.upsertMessages(messages);
};

export {
    getChatByConnectionId,
    getChatByChatId,
    getChatsByUserId,
    upsertChats,
    deleteChat,
    deleteChatByConnectionId,
    deleteAllChats,
    getMessagesByChatId,
    getMessagesByUserId,
    getMessagesByConnectionId,
    upsertMessages
};