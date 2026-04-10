import type { Client } from '../types/schema/client';
import { ScancodeAdapter } from '../integrations/adapters/scancode-adapter';
import { ClientsRepository } from '../db/repositories/clients.repo';


export class SyncPushService {
    private static readonly _instance: SyncPushService = new SyncPushService();

    private constructor() { }

    public static getInstance(): SyncPushService {
        return SyncPushService._instance;
    }

    public async updateEntities(): Promise<void> {
        await this.pushClients();
    }

    private async pushClients(): Promise<void> {
        const pending: Client[] = await ClientsRepository.findAllUnsynced();
        for (const client of pending) {
            const updated: Client = await ScancodeAdapter.updateClient(client);
            await ClientsRepository.upsertOne(updated);
        }
    }
}

export const syncPushService: SyncPushService = SyncPushService.getInstance();
