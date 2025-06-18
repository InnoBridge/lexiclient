import { SqlliteBaseClient } from "@/storage/sqllite_base_client";
import { CachedChatsClient } from "@/storage/cached_chats_client";
import { SqlLiteClient } from "@/storage/database_client";
import { Chat, Message } from "@/models/chats";
import {
    CREATE_CHATS_TABLE_QUERY,
    CREATE_CHATS_CONNECTION_INDEX_QUERY,
    CREATE_CHATS_USERS_INDEX_QUERY,
    CREATE_CHATS_UPDATED_INDEX_QUERY,
    CREATE_MESSAGES_TABLE_QUERY,
    CREATE_MESSAGES_CHAT_INDEX_QUERY,
    CREATE_MESSAGES_SENDER_INDEX_QUERY,
    CREATE_MESSAGES_CREATED_INDEX_QUERY,
    ENABLE_FOREIGN_KEYS_QUERY,
    GET_CHAT_BY_CONNECTION_ID_QUERY,
    GET_CHAT_BY_CHAT_ID_QUERY,
    GET_CHATS_BY_USER_ID_QUERY,
    UPSERT_CHATS_QUERY,
    DELETE_CHAT_QUERY,
    DELETE_CHAT_BY_CONNECTION_ID_QUERY,
    DELETE_ALL_CHATS_QUERY,
    GET_MESSAGES_BY_CHAT_ID_QUERY,
    GET_MESSAGES_BY_USER_ID_QUERY,
    GET_MESSAGES_BY_CONNECTION_ID_QUERY,
    UPSERT_MESSAGES_QUERY
} from "@/storage/queries";

class SqlliteChatsClient extends SqlliteBaseClient implements CachedChatsClient {
    constructor(db: SqlLiteClient) {
        super(db);

        this.registerMigration(0, async () => {
            await this.enableForeignKeys();

            // Create chats table
            await this.createChatsTable();
            // Create messages table
            await this.createMessagesTable();

            // Create indexes and constraints
            await this.execAsync(CREATE_CHATS_CONNECTION_INDEX_QUERY);
            await this.execAsync(CREATE_CHATS_USERS_INDEX_QUERY);
            await this.execAsync(CREATE_CHATS_UPDATED_INDEX_QUERY);
            await this.execAsync(CREATE_MESSAGES_CHAT_INDEX_QUERY);
            await this.execAsync(CREATE_MESSAGES_SENDER_INDEX_QUERY);
            await this.execAsync(CREATE_MESSAGES_CREATED_INDEX_QUERY);
        });
    }

    async createChatsTable(): Promise<void> {
        return await this.execAsync(CREATE_CHATS_TABLE_QUERY);
    }

    async createMessagesTable(): Promise<void> {
        return await this.execAsync(CREATE_MESSAGES_TABLE_QUERY);
    }

    async getChatByConnectionId(connectionId: number): Promise<Chat | null> {
        const result = await this.getFirstAsync(GET_CHAT_BY_CONNECTION_ID_QUERY, [connectionId]);
        return result ? mapToChat(result) : null;
    }

    async getChatByChatId(chatId: string): Promise<Chat | null> {
        const result = await this.getFirstAsync(GET_CHAT_BY_CHAT_ID_QUERY, [chatId]);
        return result ? mapToChat(result) : null;
    }

    private async enableForeignKeys(): Promise<void> {
        await this.execAsync(ENABLE_FOREIGN_KEYS_QUERY);
    }

    async getChatsByUserId(userId: string, updatedAfter?: number, desc: boolean = true): Promise<Chat[]> {
        const query = GET_CHATS_BY_USER_ID_QUERY(updatedAfter, desc);
        const result = await this.getAllAsync(query, [userId, userId]);
        return result.map(mapToChat);
    }

    async upsertChats(chats: Chat[]): Promise<void> {
        if (!chats || chats.length === 0) {
            return;
        }
        try {
            const query = UPSERT_CHATS_QUERY(chats.length);
            const params = chats.flatMap(chat => [
                chat.chatId, 
                chat.connectionId, 
                chat.userId1, 
                chat.userId2, 
                chat.createdAt, 
                chat.updatedAt
            ]);
            await this.runAsync(query, params);
        } catch (error) {
            console.error("Error upserting chats:", error);
            throw error;
        }
    }

    async deleteChat(chatId: string): Promise<void> {
        try {
            await this.enableForeignKeys();
            await this.runAsync(DELETE_CHAT_QUERY, [chatId]);
        } catch (error) {
            console.error("Error deleting chat:", error);
            throw error;
        }
    }

    async deleteChatByConnectionId(connectionId: number): Promise<void> {
        try {
            await this.enableForeignKeys();
            await this.runAsync(DELETE_CHAT_BY_CONNECTION_ID_QUERY, [connectionId]);
        } catch (error) {
            console.error("Error deleting chat by connection ID:", error);
            throw error;
        }
    }

    async deleteAllChats(): Promise<void> {
        try {
            await this.enableForeignKeys();
            await this.runAsync(DELETE_ALL_CHATS_QUERY);
        } catch (error) {
            console.error("Error deleting all chats:", error);
            throw error;
        }
    }

    async getMessagesByChatId(chatId: string, createdAfter?: number, limit?: number, offset?: number, desc?: boolean): Promise<Message[]> {
        const query = GET_MESSAGES_BY_CHAT_ID_QUERY(createdAfter, limit, offset, desc);
        const result = await this.getAllAsync(query, [chatId]);
        return result.map(mapToMessage);
    }

    async getMessagesByUserId(userId: string, createdAfter?: number, limit?: number, offset?: number, desc?: boolean): Promise<Message[]> {
        const query = GET_MESSAGES_BY_USER_ID_QUERY(createdAfter, limit, offset, desc);
        const result = await this.getAllAsync(query, [userId, userId]);
        return result.map(mapToMessage);
    }

    async getMessagesByConnectionId(connectionId: number, createdAfter?: number, limit?: number, offset?: number, desc?: boolean): Promise<Message[]> {
        const query = GET_MESSAGES_BY_CONNECTION_ID_QUERY(createdAfter, limit, offset, desc);
        const result = await this.getAllAsync(query, [connectionId]);
        return result.map(mapToMessage);
    }

    async upsertMessages(messages: Message[]): Promise<void> {
        if (!messages || messages.length === 0) {
            return;
        }
        try {
            const query = UPSERT_MESSAGES_QUERY(messages.length);
            const params = messages.flatMap(message => [
                message.messageId,
                message.chatId,
                message.senderId,
                message.content,
                message.isRead,
                message.createdAt
            ]);
            await this.runAsync(query, params);
        } catch (error) {
            console.error("Error upserting messages:", error);
            throw error;
        }
    }
}

const mapToChat = (row: any): Chat => {
    return {
        chatId: row.chat_id,
        connectionId: row.connection_id,
        userId1: row.user_id1,
        userId2: row.user_id2,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    } as Chat;
};

const mapToMessage = (row: any): Message => {
    return {
        messageId: row.message_id,
        chatId: row.chat_id,
        senderId: row.sender_id,
        content: row.content,
        isRead: row.is_read,
        createdAt: row.created_at
    } as Message;
}

export {
    SqlliteChatsClient
};