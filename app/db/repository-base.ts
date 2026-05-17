// --- Imports ---
import type { SQLiteDatabase, SqliteParam, SqliteParams } from '@nativescript-community/sqlite/sqlite.common';

import { Database } from './database';


export abstract class RepositoryBase {
    protected constructor() { }

    protected static async connection(): Promise<SQLiteDatabase> {
        return await Database.getConnection();
    }

    private static readonly SQL_IDENTIFIER_RE: RegExp = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

    protected static assertSafeSqlIdentifier(name: string): string {
        if (!RepositoryBase.SQL_IDENTIFIER_RE.test(name)) {
            throw new Error(`Invalid SQL identifier: ${name}`);
        }
        return name;
    }

    /**
     * Next integer strictly below zero for offline-first PKs (`id` null at insert).
     * `MIN(id) - 1` among negatives, or `-1` when none exist — avoids collision with API ids.
     */
    protected static async allocateNextLocalNegativeId(table: string): Promise<number> {
        const safe: string = RepositoryBase.assertSafeSqlIdentifier(table);
        const row: { next_id: number } | null = await RepositoryBase.queryOne<{ next_id: number }>(
            `SELECT COALESCE((SELECT MIN(id) FROM ${safe} WHERE id < 0) - 1, -1) AS next_id`,
        );
        const n: number = row == null ? NaN : Number(row.next_id);
        return Number.isFinite(n) ? n : -1;
    }

    /** SQLite stores booleans as INTEGER 0/1. */
    protected static readSqliteBool(value: unknown): boolean {
        return Number(value) === 1;
    }

    /**
     * Upsert without deleting the row (avoids ON DELETE CASCADE on parent tables e.g. `orders` → `order_items`).
     * Uses SQLite `ON CONFLICT DO UPDATE` instead of `INSERT OR REPLACE` (which is DELETE + INSERT).
     */
    protected static buildUpsertSql(
        table: string,
        columns: readonly string[],
        primaryKey: string = 'id',
    ): string {
        RepositoryBase.assertSafeSqlIdentifier(table);
        const safePk: string = RepositoryBase.assertSafeSqlIdentifier(primaryKey);
        const safeColumns: string[] = columns.map((c: string) => RepositoryBase.assertSafeSqlIdentifier(c));
        const placeholders: string = safeColumns.map(() => '?').join(', ');
        const updateAssignments: string = safeColumns
            .filter((c: string): boolean => c !== safePk)
            .map((c: string): string => `${c} = excluded.${c}`)
            .join(', ');
        return `INSERT INTO ${table} (${safeColumns.join(', ')}) VALUES (${placeholders}) ON CONFLICT(${safePk}) DO UPDATE SET ${updateAssignments}`;
    }

    protected static rowParamsForColumns<T extends object>(
        row: T,
        columns: readonly (keyof T & string)[],
    ): SqliteParam[] {
        return columns.map((col: keyof T & string) => {
            const v: unknown = (row as Record<string, unknown>)[col];
            if (v === undefined) {
                return null;
            }
            if (typeof v === 'boolean') {
                return v ? 1 : 0;
            }
            return v as SqliteParam;
        });
    }

    /**
     * `execute` on the shared connection (INSERT/UPDATE/DELETE, DDL when needed).
     */
    protected static async execute(sql: string, params?: SqliteParams): Promise<void> {
        const db: SQLiteDatabase = await RepositoryBase.connection();
        await db.execute(sql, params);
    }

    /**
     * SQLite has no `TRUNCATE TABLE`. Equivalent: remove all rows, then drop the row in
     * `sqlite_sequence` so AUTOINCREMENT restarts (no-op for tables without AUTOINCREMENT).
     * `table` must be a trusted identifier (validated).
     */
    protected static async truncateTable(table: string): Promise<void> {
        const safe: string = RepositoryBase.assertSafeSqlIdentifier(table);
        await RepositoryBase.execute(`DELETE FROM ${safe}`);
        await RepositoryBase.execute('DELETE FROM sqlite_sequence WHERE name = ?', [safe]);
    }

    protected static async insertOrReplaceMany<T extends object>(
        table: string,
        columns: readonly (keyof T & string)[],
        rows: T[],
    ): Promise<void> {
        if (rows.length === 0) {
            return;
        }
        const db: SQLiteDatabase = await RepositoryBase.connection();
        const sql: string = RepositoryBase.buildUpsertSql(table, columns as unknown as string[]);
        await db.transaction(async () => {
            for (const row of rows) {
                await db.execute(sql, RepositoryBase.rowParamsForColumns(row, columns));
            }
        });
    }

    protected static async insertOrReplaceOne<T extends object>(
        table: string,
        columns: readonly (keyof T & string)[],
        row: T,
    ): Promise<void> {
        await RepositoryBase.insertOrReplaceMany(table, columns, [row]);
    }

    protected static async queryAll<T>(sql: string, params?: SqliteParams): Promise<T[]> {
        const db: SQLiteDatabase = await RepositoryBase.connection();
        return (await db.select(sql, params)) as T[];
    }

    protected static async queryOne<T>(sql: string, params?: SqliteParams): Promise<T | null> {
        const db: SQLiteDatabase = await RepositoryBase.connection();
        const row: T | null = (await db.get(sql, params)) as T | null;
        return row ?? null;
    }

}
