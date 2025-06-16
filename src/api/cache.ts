import { CachedChatsClient } from '@/storage/cached_chats_client';
import { SqlLiteClient } from '@/storage/database_client';
import { SqlliteChatsClient } from '@/storage/sqllite_chats_client';
import { SQLiteRunResult } from "@/models/sqllite";

let cacheClient: SqlliteChatsClient | null = null;

const initializeCache = async (
    db: SqlLiteClient,
    registerMigrations?: Map<number, () => Promise<void>>
): Promise<void> => {
    cacheClient = new SqlliteChatsClient(db);
    if (registerMigrations) {
        registerMigrations.forEach((migration, version) => {
            cacheClient?.registerMigration(version, migration);
        });
    }
    await cacheClient.initializeCache();
};

const isCacheClientSet = (): boolean => {
    return cacheClient !== null;
};

const execAsync = async (query: string): Promise<void> => {
    if (!isCacheClientSet()) {
        throw new Error("UserManagement cache not initialized. Call initializeUserManagementCache first.");
    }
    return await cacheClient?.execAsync(query);
};

const runAsync = async (query: string, params?: any[]): Promise<SQLiteRunResult> => {
    if (!isCacheClientSet()) {
        throw new Error("UserManagement cache not initialized. Call initializeUserManagementCache first.");
    }
    return await cacheClient?.runAsync(query, params) as SQLiteRunResult;
};

const getAllAsync = async <T>(query: string, params?: any[]): Promise<T[]> => {
    if (!isCacheClientSet()) {
        throw new Error("UserManagement cache not initialized. Call initializeUserManagementCache first.");
    }
    return await cacheClient?.getAllAsync<T>(query, params) as T[];
};

const beginTransaction = async (): Promise<void> => {
    if (!isCacheClientSet()) {
        throw new Error("UserManagement cache not initialized. Call initializeUserManagementCache first.");
    }
    return await cacheClient?.beginTransaction();
};

const commitTransaction = async (): Promise<void> => {
    if (!isCacheClientSet()) {
        throw new Error("UserManagement cache not initialized. Call initializeUserManagementCache first.");
    }
    return await cacheClient?.commitTransaction();
};

const rollbackTransaction = async (): Promise<void> => {
    if (!isCacheClientSet()) {
        throw new Error("UserManagement cache not initialized. Call initializeUserManagementCache first.");
    }
    return await cacheClient?.rollbackTransaction();
};

export {
    initializeCache,
    isCacheClientSet,
    execAsync,
    runAsync,
    getAllAsync,
    beginTransaction,
    commitTransaction,
    rollbackTransaction,
    cacheClient
};