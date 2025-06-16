import { SQLiteRunResult } from '@/models/sqllite';

interface SqlLiteClient {
    execAsync(query: string): Promise<void>;
    runAsync(query: string, params?: any[]): Promise<SQLiteRunResult>;
    getAllAsync<T>(query: string, params?: any[]): Promise<T[]>;
    getFirstAsync<T>(query: string, params?: any[]): Promise<T | null>;
};

class ExpoSQLiteAdapter implements SqlLiteClient {
    private db: any; // Using 'any' to avoid direct dependency on expo-sqlite types
  
    constructor(db: any) {
      this.db = db;
    }
  
    async execAsync(query: string): Promise<void> {
      return await this.db.execAsync(query);
    }
  
    async runAsync(query: string, params: any[] = []): Promise<SQLiteRunResult> {
      return await this.db.runAsync(query, params) as SQLiteRunResult;
    }
  
    async getAllAsync<T>(query: string, params: any[] = []): Promise<T[]> {
        return await this.db.getAllAsync(query, params) as T[];
      }
  
    async getFirstAsync<T>(query: string, params: any[] = []): Promise<T | null> {
        return await this.db.getFirstAsync(query, params) as T | null;
      }
  };

export {
    SqlLiteClient,
    ExpoSQLiteAdapter
};