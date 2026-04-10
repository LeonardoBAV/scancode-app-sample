// --- Imports ---
import type { ProductCategory } from '../../types/schema/product-category';
import { RepositoryBase } from '../repository-base';


export class ProductCategoriesRepository extends RepositoryBase {
    private constructor() {
        super();
    }

    private static readonly CATEGORY_COLUMNS: readonly (keyof ProductCategory)[] = [
        'id',
        'remote_id',
        'is_sync',
        'name',
        'created_at',
        'updated_at',
    ];

    public static async upsertMany(categories: ProductCategory[]): Promise<void> {
        await ProductCategoriesRepository.insertOrReplaceMany(
            'product_categories',
            ProductCategoriesRepository.CATEGORY_COLUMNS,
            categories,
        );
    }

    public static async findAll(): Promise<ProductCategory[]> {
        const rows: ProductCategory[] = await ProductCategoriesRepository.queryAll<ProductCategory>(
            'SELECT * FROM product_categories ORDER BY name COLLATE NOCASE ASC',
        );
        return rows.map(
            (row: ProductCategory): ProductCategory => ({
                ...row,
                remote_id: row.remote_id ?? row.id,
                is_sync: ProductCategoriesRepository.readSqliteBool(row.is_sync as unknown),
            }),
        );
    }

    public static async findById(id: number): Promise<ProductCategory | null> {
        const row: ProductCategory | null = await ProductCategoriesRepository.queryOne<ProductCategory>(
            'SELECT * FROM product_categories WHERE id = ?',
            [id],
        );
        if (!row) {
            return null;
        }
        return {
            ...row,
            remote_id: row.remote_id ?? row.id,
            is_sync: ProductCategoriesRepository.readSqliteBool(row.is_sync as unknown),
        };
    }

    public static async truncate(): Promise<void> {
        await ProductCategoriesRepository.truncateTable('product_categories');
    }
}
