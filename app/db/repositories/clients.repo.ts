// --- Imports ---
import type { Client } from '../../types/schema/client';
import { RepositoryBase } from '../repository-base';


export class ClientsRepository extends RepositoryBase {
    private constructor() {
        super();
    }

    private static readonly CLIENT_COLUMNS: readonly (keyof Client)[] = [
        'id',
        'remote_id',
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
    }

    public static async findAll(): Promise<Client[]> {
        return await ClientsRepository.queryAll<Client>('SELECT * FROM clients ORDER BY corporate_name ASC');
    }

    public static async truncate(): Promise<void> {
        await ClientsRepository.truncateTable('clients');
    }
}
