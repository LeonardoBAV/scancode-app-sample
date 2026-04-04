// --- Imports ---
import { RepositoryBase } from '../repository-base';


export class ClientsRepository extends RepositoryBase {
    private constructor() {
        super();
    }

    public static async truncate(): Promise<void> {
        await ClientsRepository.truncateTable('clients');
    }
}
