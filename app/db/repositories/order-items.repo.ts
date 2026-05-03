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

    private static async touchOrder(orderId: number): Promise<void> {
        const now: string = new Date().toISOString();
        await OrderItemsRepository.execute(
            `
                UPDATE orders
                SET updated_at = ?, is_sync = 0
                WHERE id = ?
            `,
            [now, orderId],
        );
    }

    public static async createOne(input: {
        order_id: number;
        product_id: number;
        price: number;
        qty?: number;
        notes?: string | null;
    }): Promise<void> {
        const qty: number = Math.max(0, Math.floor(input.qty ?? 1));
        if (qty <= 0) {
            return;
        }
        await OrderItemsRepository.execute(
            `
                INSERT INTO order_items (order_id, product_id, price, qty, notes)
                VALUES (?, ?, ?, ?, ?)
            `,
            [input.order_id, input.product_id, input.price, qty, input.notes ?? null],
        );
        await OrderItemsRepository.touchOrder(input.order_id);
    }

    public static async setQtyById(orderItemId: number, qty: number): Promise<void> {
        const normalizedQty: number = Math.max(0, Math.floor(qty));
        const row: { order_id: number } | null = await OrderItemsRepository.queryOne<{ order_id: number }>(
            'SELECT order_id FROM order_items WHERE id = ?',
            [orderItemId],
        );
        if (!row) {
            return;
        }
        if (normalizedQty === 0) {
            await OrderItemsRepository.deleteById(orderItemId);
            return;
        }
        await OrderItemsRepository.execute(
            `
                UPDATE order_items
                SET qty = ?
                WHERE id = ?
            `,
            [normalizedQty, orderItemId],
        );
        await OrderItemsRepository.touchOrder(row.order_id);
    }

    public static async deleteById(orderItemId: number): Promise<void> {
        const row: { order_id: number } | null = await OrderItemsRepository.queryOne<{ order_id: number }>(
            'SELECT order_id FROM order_items WHERE id = ?',
            [orderItemId],
        );
        if (!row) {
            return;
        }
        await OrderItemsRepository.execute('DELETE FROM order_items WHERE id = ?', [orderItemId]);
        await OrderItemsRepository.touchOrder(row.order_id);
    }

    public static async upsertMany(items: OrderItem[]): Promise<void> {
        await OrderItemsRepository.insertOrReplaceMany('order_items', OrderItemsRepository.ORDER_ITEM_COLUMNS, items);
    }

    public static async truncate(): Promise<void> {
        await OrderItemsRepository.truncateTable('order_items');
    }
}
