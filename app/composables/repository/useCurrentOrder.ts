// --- Imports ---
import { ref, readonly, type DeepReadonly, type Ref } from 'vue';
import { OrdersRepository } from '../../db/repositories/orders.repo';
import type { Order } from '../../types/schema/order';


export class CurrentOrderComposable {
    private static readonly _instance: CurrentOrderComposable = new CurrentOrderComposable();

    private readonly order: Ref<Order | null> = ref<Order | null>(null);
    private readonly isLoading: Ref<boolean> = ref<boolean>(false);

    private constructor() { }

    public static getInstance(): CurrentOrderComposable {
        return CurrentOrderComposable._instance;
    }

    public getOrder(): DeepReadonly<Ref<Order | null>> {
        return readonly(this.order);
    }

    public getIsLoading(): DeepReadonly<Ref<boolean>> {
        return readonly(this.isLoading);
    }

    public async setOrder(orderId: number): Promise<void> {
        this.isLoading.value = true;
        try {
            this.order.value = await OrdersRepository.findByIdWithRelations(orderId);
        } catch (error: unknown) {
            console.error('[CurrentOrderComposable] setOrder failed:', error);
            this.order.value = null;
        } finally {
            this.isLoading.value = false;
        }
    }
}

export const useCurrentOrder: CurrentOrderComposable = CurrentOrderComposable.getInstance();
