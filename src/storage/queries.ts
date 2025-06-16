enum Transaction {
    BEGIN = 'BEGIN',
    COMMIT = 'COMMIT',
    ROLLBACK = 'ROLLBACK'
};

const CREATE_CHATS_TABLE_QUERY =
    `CREATE TABLE IF NOT EXISTS chats (
        chat_id        TEXT PRIMARY KEY,
        connection_id  INTEGER NOT NULL,
        user_id1       TEXT NOT NULL,
        user_id2       TEXT NOT NULL,
        created_at     INTEGER NOT NULL DEFAULT NOW(),
        updated_at     INTEGER DEFAULT NULL
    );`;

const CREATE_CHATS_INDEXES_QUERY = 
    `CREATE INDEX IF NOT EXISTS idx_chats_connection ON chats(connection_id);
    CREATE INDEX IF NOT EXISTS idx_chats_users ON chats(user_id1, user_id2);
    CREATE INDEX IF NOT EXISTS idx_chats_updated ON chats(updated_at DESC);`;

const CREATE_MESSAGES_TABLE_QUERY =
    ` CREATE TABLE IF NOT EXISTS messages (
        message_id     TEXT PRIMARY KEY,
        chat_id        TEXT NOT NULL,
        sender_id      TEXT NOT NULL,
        content        TEXT NOT NULL,
        is_read        BOOLEAN NOT NULL DEFAULT FALSE,
        created_at     INTEGER NOT NULL,
        FOREIGN KEY (chat_id) REFERENCES chats (id) ON DELETE CASCADE
    );`;
  
const CREATE_MESSAGES_INDEXES_QUERY = 
    `CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages(chat_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
    CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);`;

const GET_CHAT_BY_CONNECTION_ID_QUERY = 
    `SELECT * FROM chats 
        WHERE connection_id = ?`;

const GET_CHAT_BY_CHAT_ID_QUERY =
    `SELECT * FROM chats 
        WHERE chat_id = ?`;

const GET_CHATS_BY_USER_ID_QUERY = (updatedAfter?: number, desc: boolean = true) => {
    const updatedAfterCondition = updatedAfter ? 'AND COALESCE(updated_at, created_at) > ?' : '';
    const descOrder = desc ? 'DESC' : 'ASC';

    return `SELECT * FROM chats 
        WHERE (user_id1 = ? OR user_id2 = ?)
        ${updatedAfterCondition}
        ORDER BY COALESCE(updated_at, created_at) ${descOrder}`;
};

const UPSERT_CHATS_QUERY = (chatCount: number): string => {
    const placeholders = Array(chatCount).fill('(?, ?, ?, ?, ?, ?)').join(', ');
    return `INSERT INTO chats (chat_id, connection_id, user_id1, user_id2, created_at, updated_at)
        VALUES ${placeholders}
        ON CONFLICT(chat_id) DO UPDATE SET
            updated_at = excluded.updated_at;`;
};

const DELETE_CHAT_QUERY =
    `DELETE FROM chats 
        WHERE chat_id = ?`;

const DELETE_CHAT_BY_CONNECTION_ID_QUERY =
    `DELETE FROM chats 
        WHERE connection_id = ?`;

const DELETE_ALL_CHATS_QUERY =
    `DELETE FROM chats`;

const GET_MESSAGES_BY_CHAT_ID_QUERY = (createdAfter?: number, limit?: number, offset?: number, desc: boolean = true) => {
    const createdAfterCondition = createdAfter ? 'AND created_at > ?' : '';
    const limitClause = limit ? `LIMIT ${limit}` : '';
    const offsetClause = offset ? `OFFSET ${offset}` : '';
    const descOrder = desc ? 'DESC' : 'ASC';

    return `SELECT * FROM messages 
            WHERE chat_id = ?
            ${createdAfterCondition}
            ORDER BY created_at ${descOrder} 
            ${limitClause} ${offsetClause}`;
};

const GET_MESSAGES_BY_USER_ID_QUERY = (createdAfter?: number, limit?: number, offset?: number, desc: boolean = true) => {
    const createdAfterCondition = createdAfter ? 'AND m.created_at > ?' : '';
    const limitClause = limit ? `LIMIT ${limit}` : '';
    const offsetClause = offset ? `OFFSET ${offset}` : '';
    const descOrder = desc ? 'DESC' : 'ASC';

    return `SELECT m.* FROM messages m
            JOIN chats c ON m.chat_id = c.chat_id
            WHERE (c.user_id1 = ? OR c.user_id2 = ?)
            ${createdAfterCondition}
            ORDER BY m.created_at ${descOrder}  
            ${limitClause} ${offsetClause}`;
};

const GET_MESSAGES_BY_CONNECTION_ID_QUERY = (createdAfter?: number, limit?: number, offset?: number, desc: boolean = true) => {
    const createdAfterCondition = createdAfter ? 'AND m.created_at > ?' : '';
    const limitClause = limit ? `LIMIT ${limit}` : '';
    const offsetClause = offset ? `OFFSET ${offset}` : '';
    const descOrder = desc ? 'DESC' : 'ASC';

    return `SELECT m.* FROM messages m
            JOIN chats c ON m.chat_id = c.chat_id
            WHERE c.connection_id = ?
            ${createdAfterCondition}
            ORDER BY m.created_at ${descOrder}
            ${limitClause} ${offsetClause}`;
};

const UPSERT_MESSAGES_QUERY = (messageCount: number): string => {
    const placeholders = Array(messageCount).fill('(?, ?, ?, ?, ?, ?)').join(', ');
    return `INSERT INTO messages (message_id, chat_id, sender_id, content, is_read, created_at)
        VALUES ${placeholders}
        ON CONFLICT(message_id) DO UPDATE SET
            is_read = excluded.is_read;`;
};

export {
    Transaction,
    CREATE_CHATS_TABLE_QUERY,
    CREATE_CHATS_INDEXES_QUERY,
    CREATE_MESSAGES_TABLE_QUERY,
    CREATE_MESSAGES_INDEXES_QUERY,
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
};