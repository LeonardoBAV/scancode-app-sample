import type { OrderItem } from '../../types/schema/order-item';
import { RepositoryBase } from '../repository-base';


export class OrderItemsRepository extends RepositoryBase {
    private constructor() {
        super();
    }

    private static readonly ORDER_ITEM_COLUMNS: readonly (keyof OrderItem)[] = [
        'id',
        'order_id',
        'product_id',
        'price',
        'qty',
        'notes',
    ];

    public static async upsertMany(items: OrderItem[]): Promise<void> {
        await OrderItemsRepository.insertOrReplaceMany('order_items', OrderItemsRepository.ORDER_ITEM_COLUMNS, items);
    }

    public static async truncate(): Promise<void> {
        await OrderItemsRepository.truncateTable('order_items');
    }
}
