import { syncPushService } from './sync-push-service';
import { SyncPullService } from './sync-pull-service';


export class SyncService {
    private static readonly _instance: SyncService = new SyncService();

    private constructor() { }

    public static getInstance(): SyncService {
        return SyncService._instance;
    }

    public async updateEntities(): Promise<void> {
        await syncPushService.updateEntities();
        await SyncPullService.updateEntities();
    }
}

export const syncService: SyncService = SyncService.getInstance();
