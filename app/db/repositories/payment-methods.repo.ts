// --- Imports ---
import type { PaymentMethod } from '../../types/schema/payment-method';
import { RepositoryBase } from '../repository-base';


export class PaymentMethodsRepository extends RepositoryBase {
    private constructor() {
        super();
    }

    private static readonly PAYMENT_METHOD_COLUMNS: readonly (keyof PaymentMethod)[] = [
        'id',
        'remote_id',
        'name',
        'created_at',
        'updated_at',
    ];

    public static async upsertMany(methods: PaymentMethod[]): Promise<void> {
        await PaymentMethodsRepository.insertOrReplaceMany(
            'payment_methods',
            PaymentMethodsRepository.PAYMENT_METHOD_COLUMNS,
            methods,
        );
    }

    public static async findAll(): Promise<PaymentMethod[]> {
        return await PaymentMethodsRepository.queryAll<PaymentMethod>(
            'SELECT * FROM payment_methods ORDER BY name COLLATE NOCASE ASC',
        );
    }

    public static async truncate(): Promise<void> {
        await PaymentMethodsRepository.truncateTable('payment_methods');
    }
}
