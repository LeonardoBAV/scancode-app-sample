// --- Imports ---
import { RepositoryBase } from '../repository-base';


export class OrdersRepository extends RepositoryBase {
    private constructor() {
        super();
    }

    public static async truncate(): Promise<void> {
        await OrdersRepository.truncateTable('orders');
    }
}
