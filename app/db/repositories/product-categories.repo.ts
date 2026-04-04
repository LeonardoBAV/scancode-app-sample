// --- Imports ---
import { RepositoryBase } from '../repository-base';


export class ProductCategoriesRepository extends RepositoryBase {
    private constructor() {
        super();
    }

    public static async truncate(): Promise<void> {
        await ProductCategoriesRepository.truncateTable('product_categories');
    }
}
