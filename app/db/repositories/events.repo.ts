import type { SQLiteDatabase } from '@nativescript-community/sqlite';

import type { Event } from '../../types/schema/event';
import { getDatabase } from '../database';

function db(): SQLiteDatabase {
    return getDatabase();
}

export async function upsertMany(events: Event[]): Promise<void> {
    await db().transaction(async () => {
        for (const event of events) {
            await db().execute(
                `INSERT OR REPLACE INTO events (id, name, start, end, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [event.id, event.name, event.start, event.end, event.created_at, event.updated_at],
            );
        }
    });
}

export async function findAll(): Promise<Event[]> {
    return await db().select('SELECT * FROM events ORDER BY start ASC') as Event[];
}

export async function findById(id: number): Promise<Event | null> {
    const row: Event | null = await db().get('SELECT * FROM events WHERE id = ?', [id]) as Event | null;
    return row ?? null;
}

export async function deleteAll(): Promise<void> {
    await db().execute('DELETE FROM events');
}

export async function count(): Promise<number> {
    const row = await db().get('SELECT COUNT(*) as total FROM events') as { total: number } | null;
    return row?.total ?? 0;
}
