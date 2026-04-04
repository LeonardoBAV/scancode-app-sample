// --- Imports ---
import { RepositoryBase } from '../repository-base';


export class PaymentMethodsRepository extends RepositoryBase {
    private constructor() {
        super();
    }

    public static async truncate(): Promise<void> {
        await PaymentMethodsRepository.truncateTable('payment_methods');
    }
}
