import type { SQLiteDatabase } from '@nativescript-community/sqlite';

import { getDatabase } from '../database';

function db(): SQLiteDatabase {
    return getDatabase();
}

export async function getLastPulledAt(entity: string): Promise<string | null> {
    const row = await db().get('SELECT pulled_at FROM sync_log WHERE entity = ?', [entity]) as { pulled_at: string } | null;
    return row?.pulled_at ?? null;
}

export async function setLastPulledAt(entity: string, pulledAt: string): Promise<void> {
    await db().execute(
        'INSERT OR REPLACE INTO sync_log (entity, pulled_at) VALUES (?, ?)',
        [entity, pulledAt],
    );
}

export async function deleteAll(): Promise<void> {
    await db().execute('DELETE FROM sync_log');
}
