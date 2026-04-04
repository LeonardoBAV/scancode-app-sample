import { openOrCreate, type SQLiteDatabase } from '@nativescript-community/sqlite';

import { runMigrations } from './migrations';


export class Database {
    private constructor() { }

    private static readonly DB_NAME: string = 'ordy.db';
    private static sqlite: SQLiteDatabase | null = null;

    public static async getConnection(): Promise<SQLiteDatabase> {
        if (!Database.sqlite) {
            Database.sqlite = await Database.open();
        }

        return Database.sqlite;
    }

    private static close(): void {
        if (Database.sqlite && Database.sqlite.isOpen) {
            Database.sqlite.close();
            Database.sqlite = null;
        }
    }

    private static async open(): Promise<SQLiteDatabase> {
        const db: SQLiteDatabase = openOrCreate(Database.DB_NAME);
        await db.execute('PRAGMA foreign_keys = ON;');
        await runMigrations(db);
        return db;
    }
}
