import { loadEvents } from '../composables/useEvents';
import { ClientsRepository } from '../db/repositories/clients.repo';
import { EventsRepository } from '../db/repositories/events.repo';
import { OrderItemsRepository } from '../db/repositories/order-items.repo';
import { OrdersRepository } from '../db/repositories/orders.repo';
import { PaymentMethodsRepository } from '../db/repositories/payment-methods.repo';
import { ProductCategoriesRepository } from '../db/repositories/product-categories.repo';
import { ProductsRepository } from '../db/repositories/products.repo';
import { SyncLogRepository } from '../db/repositories/sync-log.repo';
import { pullFullAfterLogin } from './pull';


export class SyncService {
    private constructor() { }

    public static async syncAfterLogin(): Promise<void> {
        await SyncService.truncateOperationalDataForLoginSync();
        await pullFullAfterLogin();
        await loadEvents();
    }

    private static async truncateOperationalDataForLoginSync(): Promise<void> {
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
