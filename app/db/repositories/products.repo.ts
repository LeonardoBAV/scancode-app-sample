// --- Imports ---
import { RepositoryBase } from '../repository-base';


export class ProductsRepository extends RepositoryBase {
    private constructor() {
        super();
    }

    public static async truncate(): Promise<void> {
        await ProductsRepository.truncateTable('products');
    }
}
