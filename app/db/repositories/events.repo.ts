// --- Imports ---
import { EventsComposable } from '../../composables/event-composable';
import type { Event } from '../../types/schema/event';
import { RepositoryBase } from '../repository-base';


export class EventsRepository extends RepositoryBase {
    private constructor() {
        super();
    }

    private static readonly EVENT_COLUMNS: readonly (keyof Event)[] = [
        'id',
        'remote_id',
        'is_sync',
        'name',
        'start',
        'end',
        'created_at',
        'updated_at',
    ];

    public static async upsertMany(events: Event[]): Promise<void> {
        await EventsRepository.insertOrReplaceMany('events', EventsRepository.EVENT_COLUMNS, events);
        await EventsComposable.refresh();
    }

    public static async findAll(): Promise<Event[]> {
        const rows: Event[] = await EventsRepository.queryAll<Event>('SELECT * FROM events ORDER BY start ASC');
        return rows.map(
            (row: Event): Event => ({
                ...row,
                is_sync: EventsRepository.readSqliteBool(row.is_sync as unknown),
            }),
        );
    }

    public static async findById(id: number): Promise<Event | null> {
        const row: Event | null = await EventsRepository.queryOne<Event>('SELECT * FROM events WHERE id = ?', [id]);
        if (!row) {
            return null;
        }
        return {
            ...row,
            is_sync: EventsRepository.readSqliteBool(row.is_sync as unknown),
        };
    }

    public static async truncate(): Promise<void> {
        await EventsRepository.truncateTable('events');
    }

    public static async count(): Promise<number> {
        const row: { total: number } | null = await EventsRepository.queryOne<{ total: number }>(
            'SELECT COUNT(*) as total FROM events',
        );
        return row?.total ?? 0;
    }
}
