// --- Imports ---
import { ref, readonly, type DeepReadonly, type Ref } from 'vue';
import { OrdersRepository } from '../../db/repositories/orders.repo';
import type { Order } from '../../types/schema/order';
import { useCurrentEvent } from './useCurrentEvent';


class SelectedOrderComposable {
    private readonly order: Ref<Order | null> = ref<Order | null>(null);

    public getOrder(): DeepReadonly<Ref<Order | null>> {
        return readonly(this.order);
    }

    public clearOrder(): void {
        this.order.value = null;
    }

    public async setOrder(orderId: number): Promise<void> {
        try {
            this.order.value = await OrdersRepository.findByIdWithRelations(orderId);
            await useCurrentEvent.setEvent(this.order.value?.event_id as number);
        } catch (error: unknown) {
            console.error('[SelectedOrderComposable] setOrder failed:', error);
            this.order.value = null;
        }
    }

    public async refresh(): Promise<void> {
        if (!this.order.value || !this.order.value.id) {
            throw new Error('Order not found');
        }

        await this.setOrder(this.order.value.id);
    }
}

export const useSelectedOrder: SelectedOrderComposable = new SelectedOrderComposable();
