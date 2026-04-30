import type { Order } from '../../types/schema/order';
import type { OrderItem } from '../../types/schema/order-item';
import type { Product } from '../../types/schema/product';
import type { ProductCategory } from '../../types/schema/product-category';
import { RepositoryBase } from '../repository-base';

interface OrderItemProductJoinRow {
    // order_items
    id: number | null;
    order_id: number;
    product_id: number;
    price: number;
    qty: number;
    notes: string | null;

    // products
    p_id: number;
    p_remote_id: number | null;
    p_is_sync: number;
    p_sku: string;
    p_barcode: string | null;
    p_name: string;
    p_price: number;
    p_product_category_id: number;
    p_created_at: string;
    p_updated_at: string;

    // product_categories
    c_id: number;
    c_remote_id: number | null;
    c_is_sync: number;
    c_name: string;
    c_created_at: string;
    c_updated_at: string;
}


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
        const sql: string = `
            SELECT
                oi.id AS id,
                oi.order_id AS order_id,
                oi.product_id AS product_id,
                oi.price AS price,
                oi.qty AS qty,
                oi.notes AS notes,
                p.id AS p_id,
                p.remote_id AS p_remote_id,
                p.is_sync AS p_is_sync,
                p.sku AS p_sku,
                p.barcode AS p_barcode,
                p.name AS p_name,
                p.price AS p_price,
                p.product_category_id AS p_product_category_id,
                p.created_at AS p_created_at,
                p.updated_at AS p_updated_at,
                c.id AS c_id,
                c.remote_id AS c_remote_id,
                c.is_sync AS c_is_sync,
                c.name AS c_name,
                c.created_at AS c_created_at,
                c.updated_at AS c_updated_at
            FROM order_items oi
            INNER JOIN products p ON p.id = oi.product_id
            INNER JOIN product_categories c ON c.id = p.product_category_id
            WHERE oi.order_id = ?
            ORDER BY oi.id ASC
        `;
        const rows: OrderItemProductJoinRow[] = await OrdersRepository.queryAll<OrderItemProductJoinRow>(sql, [base.id]);
        const orderItems: OrderItem[] = rows.map((r: OrderItemProductJoinRow): OrderItem => {
            const category: ProductCategory = {
                id: r.c_id,
                remote_id: r.c_remote_id ?? r.c_id,
                is_sync: OrdersRepository.readSqliteBool(r.c_is_sync as unknown),
                name: r.c_name,
                created_at: r.c_created_at,
                updated_at: r.c_updated_at,
            };
            const product: Product = {
                id: r.p_id,
                remote_id: r.p_remote_id,
                is_sync: OrdersRepository.readSqliteBool(r.p_is_sync as unknown),
                sku: r.p_sku,
                barcode: r.p_barcode ?? '',
                name: r.p_name,
                price: r.p_price,
                product_category_id: r.p_product_category_id,
                product_category: category,
                created_at: r.p_created_at,
                updated_at: r.p_updated_at,
            };
            return {
                id: r.id,
                order_id: r.order_id,
                product_id: r.product_id,
                price: r.price,
                qty: r.qty,
                notes: r.notes,
                product,
            };
        });

        return { ...base, order_items: orderItems };
    }

    public static async upsertMany(orders: Order[]): Promise<void> {
        await OrdersRepository.insertOrReplaceMany('orders', OrdersRepository.ORDER_COLUMNS, orders);
    }

    public static async truncate(): Promise<void> {
        await OrdersRepository.truncateTable('orders');
    }
}
