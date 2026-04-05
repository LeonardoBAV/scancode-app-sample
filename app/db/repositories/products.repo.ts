// --- Imports ---
import type { Product } from '../../types/schema/product';
import { RepositoryBase } from '../repository-base';


export class ProductsRepository extends RepositoryBase {
    private constructor() {
        super();
    }

    private static readonly PRODUCT_COLUMNS: readonly (keyof Product)[] = [
        'id',
        'remote_id',
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
    }

    public static async truncate(): Promise<void> {
        await ProductsRepository.truncateTable('products');
    }
}
