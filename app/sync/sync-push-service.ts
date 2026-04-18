import type { Client } from '../types/schema/client';
import type { PaymentMethod } from '../types/schema/payment-method';
import type { Product } from '../types/schema/product';
import { ScancodeAdapter } from '../integrations/adapters/scancode-adapter';
import { ClientsRepository } from '../db/repositories/clients.repo';
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

    private async pushClients(): Promise<void> {
        const clientsPending: Client[] = await ClientsRepository.findAllUnsynced();

        for (const clientPending of clientsPending) {
            let client: Client;

            if (clientPending.remote_id == null) {
                client = await ScancodeAdapter.createClient(clientPending);
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
            const product: Product = await ScancodeAdapter.updateProduct(productPending);
            await ProductsRepository.upsertOne(product);
        }
    }

    private async pushPaymentMethods(): Promise<void> {
        const paymentMethodsPending: PaymentMethod[] = await PaymentMethodsRepository.findAllUnsynced();

        for (const paymentMethodPending of paymentMethodsPending) {
            const paymentMethod: PaymentMethod = await ScancodeAdapter.updatePaymentMethod(paymentMethodPending);
            await PaymentMethodsRepository.upsertOne(paymentMethod);
        }
    }
}

export const syncPushService: SyncPushService = SyncPushService.getInstance();
