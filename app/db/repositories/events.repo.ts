// --- Imports ---
import { EventsComposable } from '../../composables/event-composable';
import type { Event } from '../../types/schema/event';
import type { Order } from '../../types/schema/order';
import type { OrderItem } from '../../types/schema/order-item';
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
    }

    public static async findAll(withRelations: boolean = false): Promise<Event[]> {
        const rows: Event[] = await EventsRepository.queryAll<Event>('SELECT * FROM events ORDER BY start ASC');
        const events: Event[] = rows.map(
            (row: Event): Event => ({
                ...row,
                is_sync: EventsRepository.readSqliteBool(row.is_sync as unknown),
            }),
        );

        if (!withRelations) {
            return events;
        }

        const orderRows: Order[] = await EventsRepository.queryAll<Order>('SELECT * FROM orders');
        const orders: Order[] = orderRows.map((o: Order): Order => ({
            ...o,
            is_sync: EventsRepository.readSqliteBool(o.is_sync as unknown),
        }));

        const orderItems: OrderItem[] = await EventsRepository.queryAll<OrderItem>('SELECT * FROM order_items');

        const itemsByOrderId = new Map<number, OrderItem[]>();
        for (const item of orderItems) {
            const list = itemsByOrderId.get(item.order_id) ?? [];
            list.push(item);
            itemsByOrderId.set(item.order_id, list);
        }

        const ordersByEventId = new Map<number, Order[]>();
        for (const order of orders) {
            const enriched: Order = { ...order, order_items: itemsByOrderId.get(order.id as number) ?? [] };
            const list = ordersByEventId.get(order.event_id) ?? [];
            list.push(enriched);
            ordersByEventId.set(order.event_id, list);
        }

        return events.map((event: Event): Event => ({
            ...event,
            orders: ordersByEventId.get(event.id) ?? [],
        }));
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
