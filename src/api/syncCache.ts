import { ExpoSQLiteAdapter } from "@/storage/database_client";
import { chatsApi, pagination, chats } from '@innobridge/trpcmessengerclient';
import { 
    beginTransaction, 
    commitTransaction, 
    initializeCache, 
    rollbackTransaction
} from '@/api/cache';
import {
    getChatsByUserId as getCachedChatsByUserId,
    upsertChats,
    upsertMessages,
    deleteChat,
    deleteAllChats
} from '@/api/cached_chats';
import { Chat, Message } from '@/models/chats';

const { getChatsByUserId, getMessagesByChatId } = chatsApi;

let isCacheInitialized = false;
let syncInterval: NodeJS.Timeout | null = null;

/**
 * 
 * @param db - SQLite database instance for local caching
 * @param userId - Unique identifier for the authenticated user
 * @param syncInterval - Interval for periodic syncing between the cache and backend database (in seconds, default: 60)
 * @param registerMigrations - Optional map of migration functions to register for cache initialization
 * @param jwt - Optional JWT token for authenticated API requests
 * 
 * @example
 * ```typescript
 * await onLogin(
 *   database,
 *   'user_123',
 *   900, // 15 minutes
 *   'jwt_token'
 * );
 * ```
 */
const onLogin = async (
    db: any, 
    userId: string,
    syncInterval: number = 60,
    registerMigrations?: Map<number, () => Promise<void>>,
    jwt?: string,
) => {
    const dbAdapter = new ExpoSQLiteAdapter(db);

    try {
        await initializeCache(dbAdapter, registerMigrations);
        isCacheInitialized = true;
        await syncChatsAndMessages(userId, jwt);
        periodicSync(userId, syncInterval);
    } catch (error) {
        console.error("Error during login synchronization:", error);
        throw error;
    }
};

const periodicSync = (userId: string, intervalSeconds: number, jwt?: string) => {
    if (!isCacheInitialized) {
        console.warn("Cache not initialized. Skipping periodic sync.");
        return;
    }
    stopPeriodicSync();
    syncInterval = setInterval(async () => {
        try {
            await syncChatsAndMessages(userId, jwt);
        } catch (error) {
            console.error("Error during periodic sync:", error);
        }
    }, intervalSeconds * 1000);
};

const onLogout = async (userId: string) => {
    if (isCacheInitialized) {
        try {
            stopPeriodicSync();
            await beginTransaction();
            await deleteAllChats();
            await commitTransaction();
        } catch (error) {
            console.error("Error during logout cleanup:", error);
            await rollbackTransaction();
        }
    }
};

const syncChatsAndMessages = async (userId: string, jwt?: string) => {
    try {
        await beginTransaction();
        let pageNumber = 0;
        const pulledChatsMap = new Map<string, Chat>(); 
        let paginatedChats = await getChatsByUserId(userId, undefined, pageNumber, 200);
        do {
            if (paginatedChats.data.length === 0) {
                break;
            }
            
            for (const chat of paginatedChats.data) {
                pulledChatsMap.set(chat.chatId, chat);
            }
            
            pageNumber++;
            paginatedChats = await getChatsByUserId(userId, undefined, pageNumber, 200);
        } while (paginatedChats.pagination.hasNext);

        const cachedChats = await getCachedChatsByUserId(userId);
        const cachedChatsMap = new Map(cachedChats.map(chat => [chat.chatId, chat]));

        for (const [chatId, chat] of Array.from(pulledChatsMap)) {
            const cachedChat = cachedChatsMap.get(chatId);
            if (cachedChat) {
                if (cachedChat.updatedAt! >= chat.updatedAt!) {
                    continue;
                }
                const messages = await fetchAllMessages(chat.chatId, cachedChat.updatedAt);
                await upsertMessages(messages.map(msg => ({
                    ...msg,
                    isRead: false
                })));
                await upsertChats([chat]);
            } else {
                const messages = await fetchAllMessages(chat.chatId);
                await upsertMessages(messages.map(msg => ({
                    ...msg,
                    isRead: false
                })));
                await upsertChats([chat]);
            }
        }

        for (const cachedChat of cachedChats) {
            if (!pulledChatsMap.has(cachedChat.chatId)) {
                await deleteChat(cachedChat.chatId);
            }
        }
        await commitTransaction();
    } catch (error) {
        console.error("Error syncing chats and messages:", error);
        await rollbackTransaction();
        throw error;
    }
}

const fetchAllMessages = async (chatId: string, createdAfter?: number): Promise<chats.Message[]> => {
    const messages: chats.Message[] = [];
    let page = 0;
    
    let paginatedMessages = await getMessagesByChatId(chatId, createdAfter, page, 200);
    
    do {
        messages.push(...paginatedMessages.data);
        
        page++;
        paginatedMessages = await getMessagesByChatId(chatId, createdAfter, page, 200);
    } while (paginatedMessages.pagination.hasNext);
    
    return messages;
};

const stopPeriodicSync = () => {
    if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
        console.log('⏹️ Stopped periodic sync');
    }
};

export {
    onLogin,
    onLogout
};