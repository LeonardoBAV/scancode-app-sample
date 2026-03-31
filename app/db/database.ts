import { openOrCreate, type SQLiteDatabase } from '@nativescript-community/sqlite';

import { runMigrations } from './migrations';

const DB_NAME: string = 'ordy.db';

let instance: SQLiteDatabase | null = null;
let initialized: boolean = false;

export async function initDatabase(): Promise<void> {
    if (initialized) {
        return;
    }

    const db: SQLiteDatabase = openOrCreate(DB_NAME);
    await db.execute('PRAGMA journal_mode = WAL;');
    await db.execute('PRAGMA foreign_keys = ON;');
    await runMigrations(db);

    instance = db;
    initialized = true;
}

export function getDatabase(): SQLiteDatabase {
    if (!instance || !instance.isOpen) {
        throw new Error('Database not initialized. Call initDatabase() first.');
    }
    return instance;
}

export function closeDatabase(): void {
    if (instance && instance.isOpen) {
        instance.close();
        instance = null;
        initialized = false;
    }
}
