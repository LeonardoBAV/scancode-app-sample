import type { Order } from '../../types/schema/order';
import type { OrderItem } from '../../types/schema/order-item';
import { RepositoryBase } from '../repository-base';


export class OrdersRepository extends RepositoryBase {
    private constructor() {
        super();
    }

    private static readonly ORDER_COLUMNS: readonly (keyof Order)[] = [
        'id',
        'remote_id',
        'event_id',
        'status',
        'notes',
        'client_id',
        'sales_representative_id',
        'payment_method_id',
        'is_sync',
        'created_at',
        'updated_at',
    ];

    public static async findById(id: number): Promise<Order | null> {
        const row: Order | null = await OrdersRepository.queryOne<Order>('SELECT * FROM orders WHERE id = ?', [id]);
        if (!row) {
            return null;
        }
        return {
            ...row,
            is_sync: OrdersRepository.readSqliteBool(row.is_sync as unknown),
        };
    }

    /**
     * Order row plus `order_items` (schema `Order` / `OrderItem`).
     */
    public static async findByIdWithRelations(id: number): Promise<Order | null> {
        const base: Order | null = await OrdersRepository.findById(id);
        if (!base) {
            return null;
        }
        if (base.id == null) {
            return { ...base, order_items: [] };
        }
        const orderItems: OrderItem[] = await OrdersRepository.queryAll<OrderItem>(
            'SELECT * FROM order_items WHERE order_id = ?',
            [base.id],
        );
        return { ...base, order_items: orderItems };
    }

    public static async upsertMany(orders: Order[]): Promise<void> {
        await OrdersRepository.insertOrReplaceMany('orders', OrdersRepository.ORDER_COLUMNS, orders);
    }

    public static async truncate(): Promise<void> {
        await OrdersRepository.truncateTable('orders');
    }
}
