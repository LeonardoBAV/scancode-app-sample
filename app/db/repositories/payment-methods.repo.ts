// --- Imports ---
import type { PaymentMethod } from '../../types/schema/payment-method';
import { PaymentMethodsComposable } from '../../composables/payment-methods-composable';
import { RepositoryBase } from '../repository-base';


export class PaymentMethodsRepository extends RepositoryBase {
    private constructor() {
        super();
    }

    private static readonly PAYMENT_METHOD_COLUMNS: readonly (keyof PaymentMethod)[] = [
        'id',
        'remote_id',
        'is_sync',
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

    public static async upsertOne(method: PaymentMethod): Promise<void> {
        await PaymentMethodsRepository.insertOrReplaceOne(
            'payment_methods',
            PaymentMethodsRepository.PAYMENT_METHOD_COLUMNS,
            method,
        );
        await PaymentMethodsComposable.refresh();
    }

    public static async findAll(): Promise<PaymentMethod[]> {
        const rows: PaymentMethod[] = await PaymentMethodsRepository.queryAll<PaymentMethod>(
            'SELECT * FROM payment_methods ORDER BY name COLLATE NOCASE ASC',
        );
        return rows.map(
            (row: PaymentMethod): PaymentMethod => ({
                ...row,
                is_sync: PaymentMethodsRepository.readSqliteBool(row.is_sync as unknown),
            }),
        );
    }

    public static async findAllUnsynced(): Promise<PaymentMethod[]> {
        const rows: PaymentMethod[] = await PaymentMethodsRepository.queryAll<PaymentMethod>(
            'SELECT * FROM payment_methods WHERE is_sync = 0 ORDER BY id ASC',
        );
        return rows.map(
            (row: PaymentMethod): PaymentMethod => ({
                ...row,
                is_sync: PaymentMethodsRepository.readSqliteBool(row.is_sync as unknown),
            }),
        );
    }

    public static async truncate(): Promise<void> {
        await PaymentMethodsRepository.truncateTable('payment_methods');
    }
}
