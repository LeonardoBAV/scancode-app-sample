// --- Imports ---
import { RepositoryBase } from '../repository-base';


interface SyncLogRow {
    entity: string;
    pulled_at: string;
}

export class SyncLogRepository extends RepositoryBase {
    private constructor() {
        super();
    }

    private static readonly UPSERT_COLUMNS: readonly ['entity', 'pulled_at'] = ['entity', 'pulled_at'];

    public static async getLastPulledAt(entity: string): Promise<string | null> {
        const row: { pulled_at: string } | null = await SyncLogRepository.queryOne<{ pulled_at: string }>(
            'SELECT pulled_at FROM sync_log WHERE entity = ?',
            [entity],
        );
        return row?.pulled_at ?? null;
    }

    public static async setLastPulledAt(entity: string, pulledAt: string): Promise<void> {
        const row: SyncLogRow = { entity, pulled_at: pulledAt };
        await SyncLogRepository.insertOrReplaceOne<SyncLogRow>('sync_log', SyncLogRepository.UPSERT_COLUMNS, row);
    }

    public static async truncate(): Promise<void> {
        await SyncLogRepository.truncateTable('sync_log');
    }
}
