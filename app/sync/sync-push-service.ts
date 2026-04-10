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
        const pending: Client[] = await ClientsRepository.findAllUnsynced();
        for (const client of pending) {
            const updated: Client = await ScancodeAdapter.updateClient(client);
            await ClientsRepository.upsertOne(updated);
        }
    }

    private async pushProducts(): Promise<void> {
        const pending: Product[] = await ProductsRepository.findAllUnsynced();
        for (const product of pending) {
            const updated: Product = await ScancodeAdapter.updateProduct(product);
            await ProductsRepository.upsertOne(updated);
        }
    }

    private async pushPaymentMethods(): Promise<void> {
        const pending: PaymentMethod[] = await PaymentMethodsRepository.findAllUnsynced();
        for (const method of pending) {
            const updated: PaymentMethod = await ScancodeAdapter.updatePaymentMethod(method);
            await PaymentMethodsRepository.upsertOne(updated);
        }
    }
}

export const syncPushService: SyncPushService = SyncPushService.getInstance();
