// --- Imports ---
import type { Client } from '../../types/schema/client';
import { RepositoryBase } from '../repository-base';
import { ClientsComposable } from '../../composables/clients-composable';


export class ClientsRepository extends RepositoryBase {
    private constructor() {
        super();
    }

    private static readonly CLIENT_COLUMNS: readonly (keyof Client)[] = [
        'id',
        'remote_id',
        'is_sync',
        'cpf_cnpj',
        'corporate_name',
        'fantasy_name',
        'email',
        'phone',
        'carrier',
        'created_at',
        'updated_at',
    ];

    public static async upsertMany(clients: Client[]): Promise<void> {
        await ClientsRepository.insertOrReplaceMany('clients', ClientsRepository.CLIENT_COLUMNS, clients);
        await ClientsComposable.refresh();
    }

    public static async upsertOne(client: Client): Promise<void> {
        await ClientsRepository.insertOrReplaceOne('clients', ClientsRepository.CLIENT_COLUMNS, client);
        await ClientsComposable.refresh();
    }

    public static async findAll(): Promise<Client[]> {
        const rows: Client[] = await ClientsRepository.queryAll<Client>('SELECT * FROM clients ORDER BY corporate_name ASC');
        return rows.map(
            (row: Client): Client => ({
                ...row,
                is_sync: ClientsRepository.readSqliteBool(row.is_sync as unknown),
            }),
        );
    }

    public static async findAllUnsynced(): Promise<Client[]> {
        const rows: Client[] = await ClientsRepository.queryAll<Client>(
            'SELECT * FROM clients WHERE is_sync = 0 ORDER BY id ASC',
        );
        return rows.map(
            (row: Client): Client => ({
                ...row,
                is_sync: ClientsRepository.readSqliteBool(row.is_sync as unknown),
            }),
        );
    }

    public static async truncate(): Promise<void> {
        await ClientsRepository.truncateTable('clients');
        await ClientsComposable.refresh();
    }
}
