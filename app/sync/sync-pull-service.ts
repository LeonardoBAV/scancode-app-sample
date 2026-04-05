import type { ProductCategory } from '../types/schema/product-category';
import type { Product } from '../types/schema/product';
import { ScancodeAdapter } from '../integrations/adapters/scancode-adapter';
import { ProductCategoriesRepository } from '../db/repositories/product-categories.repo';
import { PaymentMethodsRepository } from '../db/repositories/payment-methods.repo';
import { OrderItemsRepository } from '../db/repositories/order-items.repo';
import { ProductsRepository } from '../db/repositories/products.repo';
import { ClientsRepository } from '../db/repositories/clients.repo';
import { EventsRepository } from '../db/repositories/events.repo';
import { SyncLogRepository } from '../db/repositories/sync-log.repo';
import { OrdersRepository } from '../db/repositories/orders.repo';
import { ClientsComposable } from '../composables/clients-composable';
import { EventsComposable } from '../composables/event-composable';
import { ProductsComposable } from '../composables/products-composable';

export class SyncPullService {
    private constructor() { }

    public static async refreshAllEntities(): Promise<void> {
        await SyncPullService.truncateAllEntities();
        await SyncPullService.pullEvents();
        await SyncPullService.pullProducts();
        await SyncPullService.pullClients();
    }

    public static async pullEvents(): Promise<void> {
        const events = await ScancodeAdapter.getEvents();
        await EventsRepository.upsertMany(events);
        await SyncLogRepository.setLastPulledAt('events', new Date().toISOString());
        await EventsComposable.refresh();
    }

    public static async pullProducts(): Promise<void> {
        const products: Product[] = await ScancodeAdapter.getProducts();

        const categoryById: Map<number, ProductCategory> = new Map<number, ProductCategory>();
        for (const product of products) {
            categoryById.set(product.product_category.id, product.product_category);
        }

        await ProductCategoriesRepository.upsertMany([...categoryById.values()]);
        await ProductsRepository.upsertMany(products);
        await SyncLogRepository.setLastPulledAt('products', new Date().toISOString());
        await ProductsComposable.refresh();
    }

    public static async pullClients(): Promise<void> {
        const clients = await ScancodeAdapter.getClients();
        await ClientsRepository.upsertMany(clients);
        await SyncLogRepository.setLastPulledAt('clients', new Date().toISOString());
        await ClientsComposable.refresh();
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
