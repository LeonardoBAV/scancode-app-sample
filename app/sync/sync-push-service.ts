import type { Client } from '../types/schema/client';
import type { Order } from '../types/schema/order';
import type { PaymentMethod } from '../types/schema/payment-method';
import type { Product } from '../types/schema/product';
import { ScancodeAdapter } from '../integrations/adapters/scancode-adapter';
import { ClientsRepository } from '../db/repositories/clients.repo';
import { OrderItemsRepository } from '../db/repositories/order-items.repo';
import { OrdersRepository } from '../db/repositories/orders.repo';
import { PaymentMethodsRepository } from '../db/repositories/payment-methods.repo';
import { ProductsRepository } from '../db/repositories/products.repo';


export class SyncPushService {
    private static readonly _instance: SyncPushService = new SyncPushService();

    private constructor() { }

    public static getInstance(): SyncPushService {
        return SyncPushService._instance;
    }

    public async updateEntities(): Promise<void> {
        await this.pushClients();
        await this.pushProducts();
        await this.pushPaymentMethods();
    }

    public async updateOrders(): Promise<void> {
        const pending: Order[] = await OrdersRepository.findAllUnsynced();
        await this.pushOrders(pending);
    }

    private async pushOrders(orders: Order[]): Promise<void> {
        for (const orderPending of orders) {

            const orderWithItems: Order = await OrdersRepository.findByIdWithRelations(orderPending.id as number) as Order;

            let order: Order;

            if (orderWithItems.remote_id == null) {
                order = await ScancodeAdapter.createOrder(orderWithItems);
                await OrdersRepository.updateOrderId(orderPending.id, order.id);
            } else {
                order = await ScancodeAdapter.updateOrder(orderWithItems);
            }

            await this.refreshOrderItems(order.id as number, order.order_items ?? []);
            order.is_sync = true;
            order.remote_id = order.id;
            await OrdersRepository.upsertOne(order);
        }
    }

    //talvez alocar esta logica depois em outro lugar
    private async refreshOrderItems(orderId: number, items: Order['order_items']): Promise<void> {
        await OrderItemsRepository.deleteByOrderId(orderId);
        const list = items ?? [];
        if (list.length > 0) {
            await OrderItemsRepository.upsertMany(list);
        }
    }

    private async pushClients(): Promise<void> {
        const clientsPending: Client[] = await ClientsRepository.findAllUnsynced();

        for (const clientPending of clientsPending) {
            let client: Client;

            if (clientPending.remote_id == null) {
                client = await ScancodeAdapter.createClient(clientPending);
                await ClientsRepository.updateClientId(clientPending.id, client.id);
            } else {
                client = await ScancodeAdapter.updateClient(clientPending);
            }

            client.is_sync = true;
            client.remote_id = client.id;

            await ClientsRepository.upsertOne(client);
        }
    }

    private async pushProducts(): Promise<void> {
        const productsPending: Product[] = await ProductsRepository.findAllUnsynced();

        for (const productPending of productsPending) {
            let product: Product;

            if (productPending.remote_id == null) {
                product = await ScancodeAdapter.createProduct(productPending);
                await ProductsRepository.updateProductId(productPending.id, product.id);
            } else {
                product = await ScancodeAdapter.updateProduct(productPending);
            }

            product.is_sync = true;
            product.remote_id = product.id;

            await ProductsRepository.upsertOne(product);
        }
    }

    private async pushPaymentMethods(): Promise<void> {
        const paymentMethodsPending: PaymentMethod[] = await PaymentMethodsRepository.findAllUnsynced();

        for (const paymentMethodPending of paymentMethodsPending) {
            let paymentMethod: PaymentMethod;

            if (paymentMethodPending.remote_id == null) {
                paymentMethod = await ScancodeAdapter.createPaymentMethod(paymentMethodPending);
                await PaymentMethodsRepository.updatePaymentMethodId(paymentMethodPending.id, paymentMethod.id);
            } else {
                paymentMethod = await ScancodeAdapter.updatePaymentMethod(paymentMethodPending);
            }

            paymentMethod.is_sync = true;
            paymentMethod.remote_id = paymentMethod.id;

            await PaymentMethodsRepository.upsertOne(paymentMethod);
        }
    }
}

export const syncPushService: SyncPushService = SyncPushService.getInstance();
