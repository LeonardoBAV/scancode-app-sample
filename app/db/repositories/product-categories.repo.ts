// --- Imports ---
import type { ProductCategory } from '../../types/schema/product-category';
import { RepositoryBase } from '../repository-base';


interface ProductCategoryRow {
    id: number;
    remote_id: number | null;
    is_sync: number;
    name: string;
    created_at: string;
    updated_at: string;
}


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
        const rows: ProductCategoryRow[] = await ProductCategoriesRepository.queryAll<ProductCategoryRow>(
            'SELECT * FROM product_categories ORDER BY name COLLATE NOCASE ASC',
        );
        return rows.map(
            (row: ProductCategoryRow): ProductCategory => ({
                id: row.id,
                remote_id: row.remote_id ?? row.id,
                is_sync: ProductCategoriesRepository.readSqliteBool(row.is_sync),
                name: row.name,
                created_at: row.created_at,
                updated_at: row.updated_at,
            }),
        );
    }

    public static async findById(id: number): Promise<ProductCategory | null> {
        const row: ProductCategoryRow | null = await ProductCategoriesRepository.queryOne<ProductCategoryRow>(
            'SELECT * FROM product_categories WHERE id = ?',
            [id],
        );
        if (!row) {
            return null;
        }
        return {
            id: row.id,
            remote_id: row.remote_id ?? row.id,
            is_sync: ProductCategoriesRepository.readSqliteBool(row.is_sync),
            name: row.name,
            created_at: row.created_at,
            updated_at: row.updated_at,
        };
    }

    public static async truncate(): Promise<void> {
        await ProductCategoriesRepository.truncateTable('product_categories');
    }
}
