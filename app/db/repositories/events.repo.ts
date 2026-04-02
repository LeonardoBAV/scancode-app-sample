// --- Imports ---
import type { SQLiteDatabase } from '@nativescript-community/sqlite';

import type { Event } from '../../types/schema/event';
import {
    insertOrReplaceMany,
    queryAll,
    queryOne,
} from '../repository-base';
import { getDatabase } from '../database';


/** Column order must match `INSERT OR REPLACE` in migrations (`events` table). */
const EVENT_COLUMNS: readonly (keyof Event)[] = [
    'id',
    'name',
    'start',
    'end',
    'created_at',
    'updated_at',
];

function db(): SQLiteDatabase {
    return getDatabase();
}

export async function upsertMany(events: Event[]): Promise<void> {
    await insertOrReplaceMany(db(), 'events', EVENT_COLUMNS, events);
}

export async function findAll(): Promise<Event[]> {
    return await queryAll<Event>(db(), 'SELECT * FROM events ORDER BY start ASC');
}

export async function findById(id: number): Promise<Event | null> {
    return await queryOne<Event>(db(), 'SELECT * FROM events WHERE id = ?', [id]);
}

export async function deleteAll(): Promise<void> {
    await db().execute('DELETE FROM events');
}

export async function count(): Promise<number> {
    const row: { total: number } | null = await queryOne<{ total: number }>(
        db(),
        'SELECT COUNT(*) as total FROM events',
    );
    return row?.total ?? 0;
}
