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

    public static async truncate(): Promise<void> {
        await ProductCategoriesRepository.truncateTable('product_categories');
    }
}
