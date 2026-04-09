import type { ProductCategory } from '../types/schema/product-category';
import type { Product } from '../types/schema/product';
import { ScancodeAdapter } from '../integrations/adapters/scancode-adapter';
import { ProductCategoriesRepository } from '../db/repositories/product-categories.repo';
import { PaymentMethodsRepository } from '../db/repositories/payment-methods.repo';
import { OrderItemsRepository } from '../db/repositories/order-items.repo';
import { ProductsRepository } from '../db/repositories/products.repo';
import { ClientsRepository } from '../db/repositories/clients.repo';
import { EventsRepository } from '../db/repositories/events.repo';
import { OrdersRepository } from '../db/repositories/orders.repo';
import { EventsComposable } from '../composables/event-composable';
import { PaymentMethodsComposable } from '../composables/payment-methods-composable';
import { ProductsComposable } from '../composables/products-composable';

export class SyncPullService {
    private constructor() { }

    public static async refreshAllEntities(): Promise<void> {
        await SyncPullService.truncateAllEntities();
        await SyncPullService.pullEvents();
        await SyncPullService.pullProducts();
        await SyncPullService.pullClients();
        await SyncPullService.pullPaymentMethods();
    }


    public static async updateEntities(): Promise<void> {
        await SyncPullService.pullProducts();
        await SyncPullService.pullClients();
        await SyncPullService.pullPaymentMethods();
    }

    private static async pullEvents(): Promise<void> {
        const events = await ScancodeAdapter.getEvents();
        await EventsRepository.upsertMany(events);
        await EventsComposable.refresh();
    }

    private static async pullProducts(): Promise<void> {
        const products: Product[] = await ScancodeAdapter.getProducts();

        const categoryById: Map<number, ProductCategory> = new Map<number, ProductCategory>();
        for (const product of products) {
            categoryById.set(product.product_category.id, product.product_category);
        }

        await ProductCategoriesRepository.upsertMany([...categoryById.values()]);
        await ProductsRepository.upsertMany(products);
        await ProductsComposable.refresh();
    }

    private static async pullClients(): Promise<void> {
        const clients = await ScancodeAdapter.getClients();
        await ClientsRepository.upsertMany(clients);
    }

    private static async pullPaymentMethods(): Promise<void> {
        const methods = await ScancodeAdapter.getPaymentMethods();
        await PaymentMethodsRepository.upsertMany(methods);
        await PaymentMethodsComposable.refresh();
    }

    private static async truncateAllEntities(): Promise<void> {
        await OrderItemsRepository.truncate();
        await OrdersRepository.truncate();
        await ProductsRepository.truncate();
        await ProductCategoriesRepository.truncate();
        await ClientsRepository.truncate();
        await PaymentMethodsRepository.truncate();
        await EventsRepository.truncate();
    }
}
