// --- Imports ---
import type { Client } from '../../types/schema/client';
import type { Event } from '../../types/schema/event';
import type { Order } from '../../types/schema/order';
import type { OrderItem } from '../../types/schema/order-item';
import { ClientsRepository } from './clients.repo';
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

        const clientsById: Map<number, Client> = await EventsRepository.clientsMapForOrders(orders);

        const ordersByEventId = new Map<number, Order[]>();
        for (const order of orders) {
            const enriched: Order = {
                ...order,
                order_items: itemsByOrderId.get(order.id as number) ?? [],
                client: clientsById.get(order.client_id) ?? null,
            };
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

    /**
     * Event row plus `orders` for this event and each order's `order_items` (schema `Event` / `Order` / `OrderItem`).
     */
    public static async findByIdWithRelations(id: number): Promise<Event | null> {
        const base: Event | null = await EventsRepository.findById(id);
        if (!base) {
            return null;
        }

        const orderRows: Order[] = await EventsRepository.queryAll<Order>(
            'SELECT * FROM orders WHERE event_id = ? ORDER BY created_at ASC',
            [id],
        );
        const orders: Order[] = orderRows.map((o: Order): Order => ({
            ...o,
            is_sync: EventsRepository.readSqliteBool(o.is_sync as unknown),
        }));

        if (orders.length === 0) {
            return { ...base, orders: [] };
        }

        const clientsById: Map<number, Client> = await EventsRepository.clientsMapForOrders(orders);

        const orderIds: number[] = orders
            .map((o: Order) => o.id)
            .filter((oid: number | null): oid is number => oid !== null && oid !== undefined);

        if (orderIds.length === 0) {
            return {
                ...base,
                orders: orders.map(
                    (o: Order): Order => ({
                        ...o,
                        order_items: [],
                        client: clientsById.get(o.client_id) ?? null,
                    }),
                ),
            };
        }

        const placeholders: string = orderIds.map(() => '?').join(', ');
        const orderItems: OrderItem[] = await EventsRepository.queryAll<OrderItem>(
            `SELECT * FROM order_items WHERE order_id IN (${placeholders})`,
            orderIds,
        );

        const itemsByOrderId = new Map<number, OrderItem[]>();
        for (const item of orderItems) {
            const list: OrderItem[] = itemsByOrderId.get(item.order_id) ?? [];
            list.push(item);
            itemsByOrderId.set(item.order_id, list);
        }

        const enrichedOrders: Order[] = orders.map((order: Order): Order => ({
            ...order,
            order_items: itemsByOrderId.get(order.id as number) ?? [],
            client: clientsById.get(order.client_id) ?? null,
        }));

        return {
            ...base,
            orders: enrichedOrders,
        };
    }

    private static async clientsMapForOrders(orders: Order[]): Promise<Map<number, Client>> {
        const clientIds: number[] = [
            ...new Set(
                orders
                    .map((o: Order) => o.client_id)
                    .filter((cid: number): cid is number => Number.isFinite(cid)),
            ),
        ];
        const clients: Client[] = await ClientsRepository.findManyByIds(clientIds);
        const byId = new Map<number, Client>();
        for (const client of clients) {
            if (client.id != null) {
                byId.set(client.id, client);
            }
        }
        return byId;
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
