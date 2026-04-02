// --- Imports ---
import type { SQLiteDatabase } from '@nativescript-community/sqlite';

import { insertOrReplaceOne, queryOne } from '../repository-base';
import { getDatabase } from '../database';


const SYNC_LOG_UPSERT_COLUMNS: readonly ['entity', 'pulled_at'] = ['entity', 'pulled_at'];

interface SyncLogRow {
    entity: string;
    pulled_at: string;
}

function db(): SQLiteDatabase {
    return getDatabase();
}

export async function getLastPulledAt(entity: string): Promise<string | null> {
    const row: { pulled_at: string } | null = await queryOne<{ pulled_at: string }>(
        db(),
        'SELECT pulled_at FROM sync_log WHERE entity = ?',
        [entity],
    );
    return row?.pulled_at ?? null;
}

export async function setLastPulledAt(entity: string, pulledAt: string): Promise<void> {
    const row: SyncLogRow = { entity, pulled_at: pulledAt };
    await insertOrReplaceOne<SyncLogRow>(db(), 'sync_log', SYNC_LOG_UPSERT_COLUMNS, row);
}

export async function deleteAll(): Promise<void> {
    await db().execute('DELETE FROM sync_log');
}
