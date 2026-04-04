import * as scancodeAdapter from '../integrations/adapters/scancode-adapter';
import { EventsRepository } from '../db/repositories/events.repo';
import { SyncLogRepository } from '../db/repositories/sync-log.repo';
import { OrdersRepository } from '../db/repositories/orders.repo';
import { OrderItemsRepository } from '../db/repositories/order-items.repo';
import { ProductsRepository } from '../db/repositories/products.repo';
import { ClientsRepository } from '../db/repositories/clients.repo';
import { PaymentMethodsRepository } from '../db/repositories/payment-methods.repo';
import { ProductCategoriesRepository } from '../db/repositories/product-categories.repo';
import { EventsComposable } from '../composables/event-composable';

export class SyncPullService {
    private constructor() { }

    public static async refreshAllEntities(): Promise<void> {
        await SyncPullService.truncateAllEntities();
        await SyncPullService.pullEvents();
    }

    public static async pullEvents(): Promise<void> {
        const events = await scancodeAdapter.getEvents();
        await EventsRepository.upsertMany(events);
        await SyncLogRepository.setLastPulledAt('events', new Date().toISOString());
        await EventsComposable.refresh();
    }

    private static async truncateAllEntities(): Promise<void> {
        await OrderItemsRepository.truncate();
        await OrdersRepository.truncate();
        await ProductsRepository.truncate();
        await ProductCategoriesRepository.truncate();
        await ClientsRepository.truncate();
        await PaymentMethodsRepository.truncate();
        await EventsRepository.truncate();
        await SyncLogRepository.truncate();
    }
}
