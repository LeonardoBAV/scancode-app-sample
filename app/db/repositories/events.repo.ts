// --- Imports ---
import type { Event } from '../../types/schema/event';
import { RepositoryBase } from '../repository-base';


export class EventsRepository extends RepositoryBase {
    private constructor() {
        super();
    }

    private static readonly EVENT_COLUMNS: readonly (keyof Event)[] = [
        'id',
        'remote_id',
        'name',
        'start',
        'end',
        'created_at',
        'updated_at',
    ];

    public static async upsertMany(events: Event[]): Promise<void> {
        await EventsRepository.insertOrReplaceMany('events', EventsRepository.EVENT_COLUMNS, events);
    }

    public static async findAll(): Promise<Event[]> {
        return await EventsRepository.queryAll<Event>('SELECT * FROM events ORDER BY start ASC');
    }

    public static async findById(id: number): Promise<Event | null> {
        return await EventsRepository.queryOne<Event>('SELECT * FROM events WHERE id = ?', [id]);
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
