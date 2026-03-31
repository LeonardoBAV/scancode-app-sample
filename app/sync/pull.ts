import * as scancodeAdapter from '../integrations/adapters/scancode-adapter';
import * as eventsRepo from '../db/repositories/events.repo';
import * as syncLogRepo from '../db/repositories/sync-log.repo';

export async function pullFullAfterLogin(): Promise<void> {
    await pullEvents();
}

export async function pullCatalogFromProfile(): Promise<void> {
    // V1: only catalog entities — to be implemented
    // await pullProductCategories();
    // await pullProducts();
    // await pullClients();
    // await pullPaymentMethods();
}

export async function pullEvents(): Promise<void> {
    const events = await scancodeAdapter.getEvents();
    await eventsRepo.upsertMany(events);
    await syncLogRepo.setLastPulledAt('events', new Date().toISOString());
}
