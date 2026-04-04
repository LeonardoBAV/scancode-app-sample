// --- Imports ---
import { RepositoryBase } from '../repository-base';


export class OrderItemsRepository extends RepositoryBase {
    private constructor() {
        super();
    }

    public static async truncate(): Promise<void> {
        await OrderItemsRepository.truncateTable('order_items');
    }
}
