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
        await PaymentMethodsComposable.refresh();
    }

    public static async upsertOne(method: PaymentMethod): Promise<void> {
        if (method.id == null) {
            method.id = await PaymentMethodsRepository.allocateNextLocalNegativeId('payment_methods');
        }
        await PaymentMethodsRepository.insertOrReplaceOne(
            'payment_methods',
            PaymentMethodsRepository.PAYMENT_METHOD_COLUMNS,
            method,
        );
        await PaymentMethodsComposable.refresh();
    }

    /** `UPDATE` só da coluna `id` (PK local → id da API); FKs com ON UPDATE CASCADE acompanham. */
    public static async updatePaymentMethodId(fromId: number | null, toId: number | null): Promise<void> {
        if (fromId == null || toId == null || fromId === toId || !Number.isFinite(fromId) || !Number.isFinite(toId)) {
            return;
        }
        await PaymentMethodsRepository.execute(
            'UPDATE payment_methods SET id = ? WHERE id = ? AND remote_id IS NULL',
            [toId, fromId],
        );
    }

    public static async findAll(): Promise<PaymentMethod[]> {
        const rows: PaymentMethod[] = await PaymentMethodsRepository.queryAll<PaymentMethod>(
            'SELECT * FROM payment_methods ORDER BY name COLLATE NOCASE ASC',
        );
        return rows.map((row: PaymentMethod): PaymentMethod => PaymentMethodsRepository.mapSqlitePaymentMethodRow(row));
    }

    /**
     * First payment method with the same stored `name` string (exact match), or null.
     */
    public static async loadByName(name: string): Promise<PaymentMethod | null> {
        const row: PaymentMethod | null = await PaymentMethodsRepository.queryOne<PaymentMethod>(
            'SELECT * FROM payment_methods WHERE name = ? LIMIT 1',
            [name],
        );
        return row == null ? null : PaymentMethodsRepository.mapSqlitePaymentMethodRow(row);
    }

    public static async findAllUnsynced(): Promise<PaymentMethod[]> {
        const rows: PaymentMethod[] = await PaymentMethodsRepository.queryAll<PaymentMethod>(
            'SELECT * FROM payment_methods WHERE is_sync = 0 ORDER BY id ASC',
        );
        return rows.map((row: PaymentMethod): PaymentMethod => PaymentMethodsRepository.mapSqlitePaymentMethodRow(row));
    }

    private static mapSqlitePaymentMethodRow(row: PaymentMethod): PaymentMethod {
        return {
            ...row,
            is_sync: PaymentMethodsRepository.readSqliteBool(row.is_sync as unknown),
        };
    }

    public static async truncate(): Promise<void> {
        await PaymentMethodsRepository.truncateTable('payment_methods');
    }
}
