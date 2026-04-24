import type { Order } from '../../types/schema/order';
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

    public static async upsertMany(orders: Order[]): Promise<void> {
        await OrdersRepository.insertOrReplaceMany('orders', OrdersRepository.ORDER_COLUMNS, orders);
    }

    public static async truncate(): Promise<void> {
        await OrdersRepository.truncateTable('orders');
    }
}
