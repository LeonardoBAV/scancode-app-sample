import { openOrCreate, type SQLiteDatabase } from '@nativescript-community/sqlite';

import { runMigrations } from './migrations';

const DB_NAME: string = 'ordy.db';

let instance: SQLiteDatabase | null = null;
let initialized: boolean = false;

export async function initDatabase(): Promise<void> {
    if (initialized && instance?.isOpen) {
        return;
    }

    if (instance && !instance.isOpen) {
        instance = null;
        initialized = false;
    }

    const db: SQLiteDatabase = openOrCreate(DB_NAME);
    // Android: SQLiteDatabase.execSQL (used by db.execute) cannot run PRAGMAs that return rows
    // (e.g. journal_mode). That throws: "Queries can be performed using ... rawQuery only."
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
