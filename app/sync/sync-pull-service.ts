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
    private static readonly _instance: SyncPullService = new SyncPullService();

    private constructor() { }

    public static getInstance(): SyncPullService {
        return SyncPullService._instance;
    }

    public async refresh(): Promise<void> {
        await this.truncateAllEntities();
        await this.pullEvents();
        await this.pullProductCategories();
        await this.pullProducts();
        await this.pullClients();
        await this.pullPaymentMethods();
    }

    public async updateEntities(): Promise<void> {
        await this.pullProductCategories();
        await this.pullProducts();
        await this.pullClients();
        await this.pullPaymentMethods();
    }

    private async pullEvents(): Promise<void> {
        const events = await ScancodeAdapter.getEvents();
        await EventsRepository.upsertMany(events);
    }

    private async pullProductCategories(): Promise<void> {
        const categories: ProductCategory[] = await ScancodeAdapter.getProductCategories();
        await ProductCategoriesRepository.upsertMany(categories);
    }

    private async pullProducts(): Promise<void> {
        const products: Product[] = await ScancodeAdapter.getProducts();
        await ProductsRepository.upsertMany(products);
    }

    private async pullClients(): Promise<void> {
        const clients = await ScancodeAdapter.getClients();
        await ClientsRepository.upsertMany(clients);
    }

    private async pullPaymentMethods(): Promise<void> {
        const methods = await ScancodeAdapter.getPaymentMethods();
        await PaymentMethodsRepository.upsertMany(methods);
        await PaymentMethodsComposable.refresh();
    }

    private async truncateAllEntities(): Promise<void> {
        await OrderItemsRepository.truncate();
        await OrdersRepository.truncate();
        await ProductsRepository.truncate();
        await ProductCategoriesRepository.truncate();
        await ClientsRepository.truncate();
        await PaymentMethodsRepository.truncate();
        await EventsRepository.truncate();
    }
}

export const syncPullService: SyncPullService = SyncPullService.getInstance();
