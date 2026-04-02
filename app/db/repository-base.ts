// --- Imports ---
import type { SQLiteDatabase, SqliteParam, SqliteParams } from '@nativescript-community/sqlite/sqlite.common';


/** Allowed characters for table/column names used in generated SQL (avoids injection via identifiers). */
const SQL_IDENTIFIER_RE: RegExp = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

/**
 * Throws if the name is not a simple SQLite identifier (letters, digits, underscore).
 * Use only for table/column names you control — never for user-facing search strings.
 */
export function assertSafeSqlIdentifier(name: string): string {
    if (!SQL_IDENTIFIER_RE.test(name)) {
        throw new Error(`Invalid SQL identifier: ${name}`);
    }
    return name;
}

/**
 * Builds `INSERT OR REPLACE INTO table (col1, ...) VALUES (?, ?, ...)`.
 * Identifiers are validated; values must still be passed as bound parameters.
 */
export function buildInsertOrReplaceSql(table: string, columns: readonly string[]): string {
    assertSafeSqlIdentifier(table);
    const safeColumns: string[] = columns.map((c: string) => assertSafeSqlIdentifier(c));
    const placeholders: string = safeColumns.map(() => '?').join(', ');
    return `INSERT OR REPLACE INTO ${table} (${safeColumns.join(', ')}) VALUES (${placeholders})`;
}

/**
 * Maps a row object to positional params following `columns` order.
 * `undefined` becomes `null` for SQLite.
 */
export function rowParamsForColumns<T extends object>(
    row: T,
    columns: readonly (keyof T & string)[],
): SqliteParam[] {
    return columns.map((col: keyof T & string) => {
        const v: unknown = (row as Record<string, unknown>)[col];
        if (v === undefined) {
            return null;
        }
        return v as SqliteParam;
    });
}

/**
 * Runs `INSERT OR REPLACE` for each row inside a single transaction.
 */
export async function insertOrReplaceMany<T extends object>(
    db: SQLiteDatabase,
    table: string,
    columns: readonly (keyof T & string)[],
    rows: T[],
): Promise<void> {
    if (rows.length === 0) {
        return;
    }
    const sql: string = buildInsertOrReplaceSql(table, columns as unknown as string[]);
    await db.transaction(async () => {
        for (const row of rows) {
            await db.execute(sql, rowParamsForColumns(row, columns));
        }
    });
}

/**
 * Single-row `INSERT OR REPLACE` (same semantics as insertOrReplaceMany with one row).
 */
export async function insertOrReplaceOne<T extends object>(
    db: SQLiteDatabase,
    table: string,
    columns: readonly (keyof T & string)[],
    row: T,
): Promise<void> {
    await insertOrReplaceMany(db, table, columns, [row]);
}

/**
 * Typed wrapper for `db.select`.
 */
export async function queryAll<T>(db: SQLiteDatabase, sql: string, params?: SqliteParams): Promise<T[]> {
    return (await db.select(sql, params)) as T[];
}

/**
 * Typed wrapper for `db.get`; returns null when no row.
 */
export async function queryOne<T>(db: SQLiteDatabase, sql: string, params?: SqliteParams): Promise<T | null> {
    const row: T | null = (await db.get(sql, params)) as T | null;
    return row ?? null;
}
