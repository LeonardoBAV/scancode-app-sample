import { syncPushService } from './sync-push-service';
import { syncPullService } from './sync-pull-service';


export class SyncService {
    private static readonly _instance: SyncService = new SyncService();

    private constructor() { }

    public static getInstance(): SyncService {
        return SyncService._instance;
    }

    public async refresh(): Promise<void> {
        await syncPullService.refresh();
    }

    public async updateEntities(): Promise<void> {
        await syncPushService.updateEntities();
        await syncPullService.updateEntities();
    }

}

export const syncService: SyncService = SyncService.getInstance();
