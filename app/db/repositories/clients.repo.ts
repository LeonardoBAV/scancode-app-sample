// --- Imports ---
import type { Client } from '../../types/schema/client';
import { ClientsComposable } from '../../composables/clients-composable';
import { RepositoryBase } from '../repository-base';


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

    public static async upsertOne(client: Client): Promise<Client> {
        if (client.id == null) {
            client.id = await ClientsRepository.getNextLocalClientId();
            client.remote_id = null;
        }
        await ClientsRepository.insertOrReplaceOne('clients', ClientsRepository.CLIENT_COLUMNS, client);
        await ClientsComposable.refresh();
        return client;
    }

    /** Next INTEGER PRIMARY KEY candidate for locally created clients (offline-first). */
    public static async getNextLocalClientId(): Promise<number> {
        interface MaxIdRow {
            n: number;
        }
        const row: MaxIdRow | null = await ClientsRepository.queryOne<MaxIdRow>(
            'SELECT COALESCE(MAX(id), 0) + 1 AS n FROM clients',
        );
        return row?.n ?? 1;
    }

    public static async findAll(): Promise<Client[]> {
        const rows: Client[] = await ClientsRepository.queryAll<Client>('SELECT * FROM clients ORDER BY corporate_name ASC');
        return rows.map((row: Client): Client => ClientsRepository.mapSqliteClientRow(row));
    }

    /**
     * First client with the same stored `cpf_cnpj` string (exact match), or null.
     */
    public static async loadByCpfCnpj(cpfCnpj: string): Promise<Client | null> {
        const row: Client | null = await ClientsRepository.queryOne<Client>(
            'SELECT * FROM clients WHERE cpf_cnpj = ? LIMIT 1',
            [cpfCnpj],
        );
        return row == null ? null : ClientsRepository.mapSqliteClientRow(row);
    }

    public static async findAllUnsynced(): Promise<Client[]> {
        const rows: Client[] = await ClientsRepository.queryAll<Client>(
            'SELECT * FROM clients WHERE is_sync = 0 ORDER BY id ASC',
        );
        return rows.map((row: Client): Client => ClientsRepository.mapSqliteClientRow(row));
    }

    private static mapSqliteClientRow(row: Client): Client {
        return {
            ...row,
            is_sync: ClientsRepository.readSqliteBool(row.is_sync as unknown),
        };
    }

    public static async truncate(): Promise<void> {
        await ClientsRepository.truncateTable('clients');
        await ClientsComposable.refresh();
    }
}
