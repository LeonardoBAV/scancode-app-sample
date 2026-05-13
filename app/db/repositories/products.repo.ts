// --- Imports ---
import type { Product } from '../../types/schema/product';
import type { ProductCategory } from '../../types/schema/product-category';
import { ProductsComposable } from '../../composables/products-composable';
import { RepositoryBase } from '../repository-base';


interface ProductJoinRow {
    id: number;
    remote_id: number | null;
    is_sync: number;
    sku: string;
    barcode: string | null;
    name: string;
    price: number;
    product_category_id: number;
    created_at: string;
    updated_at: string;
    category_id: number;
    category_remote_id: number | null;
    category_is_sync: number;
    category_name: string;
    category_created_at: string;
    category_updated_at: string;
}


export class ProductsRepository extends RepositoryBase {
    private constructor() {
        super();
    }

    private static mapJoinRow(row: ProductJoinRow): Product {
        const category: ProductCategory = {
            id: row.category_id,
            remote_id: row.category_remote_id ?? row.category_id,
            is_sync: ProductsRepository.readSqliteBool(row.category_is_sync),
            name: row.category_name,
            created_at: row.category_created_at,
            updated_at: row.category_updated_at,
        };
        return {
            id: row.id,
            remote_id: row.remote_id,
            is_sync: ProductsRepository.readSqliteBool(row.is_sync),
            sku: row.sku,
            barcode: row.barcode ?? '',
            name: row.name,
            price: row.price,
            product_category_id: row.product_category_id,
            product_category: category,
            created_at: row.created_at,
            updated_at: row.updated_at,
        };
    }

    private static readonly PRODUCT_COLUMNS: readonly (keyof Product)[] = [
        'id',
        'remote_id',
        'is_sync',
        'sku',
        'barcode',
        'name',
        'price',
        'product_category_id',
        'created_at',
        'updated_at',
    ];

    public static async upsertMany(products: Product[]): Promise<void> {
        await ProductsRepository.insertOrReplaceMany('products', ProductsRepository.PRODUCT_COLUMNS, products);
        await ProductsComposable.refresh();
    }

    public static async upsertOne(product: Product): Promise<void> {
        if (product.id == null) {
            product.id = await ProductsRepository.allocateNextLocalNegativeId('products');
        }
        await ProductsRepository.insertOrReplaceOne('products', ProductsRepository.PRODUCT_COLUMNS, product);
        await ProductsComposable.refresh();
    }

    /** `UPDATE` só da coluna `id` (PK local → id da API); FKs com ON UPDATE CASCADE acompanham. */
    public static async updateProductId(fromId: number | null, toId: number | null): Promise<void> {
        if (fromId == null || toId == null || fromId === toId || !Number.isFinite(fromId) || !Number.isFinite(toId)) {
            return;
        }
        await ProductsRepository.execute(
            'UPDATE products SET id = ? WHERE id = ? AND remote_id IS NULL',
            [toId, fromId],
        );
    }

    public static async findAll(): Promise<Product[]> {
        const sql: string = `
            SELECT
                p.id AS id,
                p.remote_id AS remote_id,
                p.is_sync AS is_sync,
                p.sku AS sku,
                p.barcode AS barcode,
                p.name AS name,
                p.price AS price,
                p.product_category_id AS product_category_id,
                p.created_at AS created_at,
                p.updated_at AS updated_at,
                c.id AS category_id,
                c.remote_id AS category_remote_id,
                c.is_sync AS category_is_sync,
                c.name AS category_name,
                c.created_at AS category_created_at,
                c.updated_at AS category_updated_at
            FROM products p
            INNER JOIN product_categories c ON c.id = p.product_category_id
            ORDER BY p.name COLLATE NOCASE ASC
        `;
        const rows: ProductJoinRow[] = await ProductsRepository.queryAll<ProductJoinRow>(sql);
        return rows.map((row: ProductJoinRow): Product => ProductsRepository.mapJoinRow(row));
    }

    /**
     * First product with exact SKU match (case-sensitive), or null.
     */
    public static async loadBySku(sku: string): Promise<Product | null> {
        const sql: string = `
            SELECT
                p.id AS id,
                p.remote_id AS remote_id,
                p.is_sync AS is_sync,
                p.sku AS sku,
                p.barcode AS barcode,
                p.name AS name,
                p.price AS price,
                p.product_category_id AS product_category_id,
                p.created_at AS created_at,
                p.updated_at AS updated_at,
                c.id AS category_id,
                c.remote_id AS category_remote_id,
                c.is_sync AS category_is_sync,
                c.name AS category_name,
                c.created_at AS category_created_at,
                c.updated_at AS category_updated_at
            FROM products p
            INNER JOIN product_categories c ON c.id = p.product_category_id
            WHERE p.sku = ?
            LIMIT 1
        `;
        const row: ProductJoinRow | null = await ProductsRepository.queryOne<ProductJoinRow>(sql, [sku]);
        return row == null ? null : ProductsRepository.mapJoinRow(row);
    }

    /**
     * First product with exact barcode match (non-empty barcode only), or null.
     */
    public static async loadByBarcode(barcode: string): Promise<Product | null> {
        const sql: string = `
            SELECT
                p.id AS id,
                p.remote_id AS remote_id,
                p.is_sync AS is_sync,
                p.sku AS sku,
                p.barcode AS barcode,
                p.name AS name,
                p.price AS price,
                p.product_category_id AS product_category_id,
                p.created_at AS created_at,
                p.updated_at AS updated_at,
                c.id AS category_id,
                c.remote_id AS category_remote_id,
                c.is_sync AS category_is_sync,
                c.name AS category_name,
                c.created_at AS category_created_at,
                c.updated_at AS category_updated_at
            FROM products p
            INNER JOIN product_categories c ON c.id = p.product_category_id
            WHERE p.barcode = ?
            LIMIT 1
        `;
        const row: ProductJoinRow | null = await ProductsRepository.queryOne<ProductJoinRow>(sql, [barcode]);
        return row == null ? null : ProductsRepository.mapJoinRow(row);
    }

    public static async findAllUnsynced(): Promise<Product[]> {
        const sql: string = `
            SELECT
                p.id AS id,
                p.remote_id AS remote_id,
                p.is_sync AS is_sync,
                p.sku AS sku,
                p.barcode AS barcode,
                p.name AS name,
                p.price AS price,
                p.product_category_id AS product_category_id,
                p.created_at AS created_at,
                p.updated_at AS updated_at,
                c.id AS category_id,
                c.remote_id AS category_remote_id,
                c.is_sync AS category_is_sync,
                c.name AS category_name,
                c.created_at AS category_created_at,
                c.updated_at AS category_updated_at
            FROM products p
            INNER JOIN product_categories c ON c.id = p.product_category_id
            WHERE p.is_sync = 0
            ORDER BY p.id ASC
        `;
        const rows: ProductJoinRow[] = await ProductsRepository.queryAll<ProductJoinRow>(sql);
        return rows.map((row: ProductJoinRow): Product => ProductsRepository.mapJoinRow(row));
    }

    public static async truncate(): Promise<void> {
        await ProductsRepository.truncateTable('products');
    }
}
