import { CachedBaseClient } from '@/storage/cached_base_client';
import { SqlLiteClient } from "@/storage/database_client";
import { SQLiteRunResult } from "@/models/sqllite";
import { Transaction } from "@/storage/queries";

class SqlliteBaseClient implements CachedBaseClient {
    private db: SqlLiteClient;
    private migrations: Map<number, () => Promise<void>> = new Map();

    constructor(db: SqlLiteClient) {
        this.db = db;
    }

    async execAsync(query: string): Promise<void> {
        return await this.db.execAsync(query);
    }

    async runAsync(query: string, params: any[] = []): Promise<SQLiteRunResult> {
        return await this.db.runAsync(query, params);
    };

    async getAllAsync<T>(query: string, params: any[] = []): Promise<T[]> {
        return await this.db.getAllAsync<T>(query, params);
    };

    async getFirstAsync<T>(query: string, params: any[] = []): Promise<T | null> {
        return await this.db.getFirstAsync<T>(query, params);
    };

    async beginTransaction(): Promise<void> {
        return await this.execAsync(`${Transaction.BEGIN};`);
    };

    async commitTransaction(): Promise<void> {
        return await this.execAsync(`${Transaction.COMMIT};`);
    };

    async rollbackTransaction(): Promise<void> {
        return await this.execAsync(`${Transaction.ROLLBACK};`);
    };

        // Public method to register migrations
    registerMigration(fromVersion: number, migrationFn: () => Promise<void>): void {
        this.migrations.set(fromVersion, migrationFn);
    }

    async initializeCache(): Promise<void> {
        let result = await this.db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
        let currentDbVersion = result?.user_version ?? 0;

        if (currentDbVersion < this.getHighestMigrationVersion()) {
            try {            
                // Set SQLite mode and enable foreign keys
                await this.execAsync('PRAGMA journal_mode = "wal";');
                await this.execAsync('PRAGMA foreign_keys = ON;');
                
                // THEN begin transaction for schema creation
                await this.beginTransaction();

                try {
                    // Apply migrations in order
                    while (this.migrations.has(currentDbVersion)) {
                        console.log(`Upgrading from version ${currentDbVersion} to ${currentDbVersion + 1}`);
                        const migration = this.migrations.get(currentDbVersion);
                        await migration!();
                        currentDbVersion++;
                        
                        // Update the version after each successful migration
                        await this.execAsync(`PRAGMA user_version = ${currentDbVersion}`);
                    }
                    
                    console.log(`Database schema is at version ${currentDbVersion}`);
                    
                    // Commit all migrations
                    await this.commitTransaction();
                    console.log("Database migrations completed successfully");
                    
                } catch (error) {
                    // Rollback on any error
                    await this.rollbackTransaction();
                    console.error("Database migration failed:", error);
                    throw error;
                }
            } catch (error) {
                console.error("Database initialization failed:", error);
                throw error;
            }
        }
    }

    // Helper method to get the highest migration version
    private getHighestMigrationVersion(): number {
        return Math.max(-1, ...Array.from(this.migrations.keys())) + 1;
    }
}

export {
    SqlliteBaseClient
};
