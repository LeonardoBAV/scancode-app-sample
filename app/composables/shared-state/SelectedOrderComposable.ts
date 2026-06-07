// --- Imports ---
import { ref, readonly, type DeepReadonly, type Ref } from 'vue';
import { OrdersRepository } from '../../db/repositories/orders.repo';
import { OrderItemsRepository } from '../../db/repositories/order-items.repo';
import type { Order } from '../../types/schema/order';
import type { OrderItem } from '../../types/schema/order-item';


class SelectedOrderComposable {
    private readonly order: Ref<Order | null> = ref<Order | null>(null);

    public getOrder(): DeepReadonly<Ref<Order | null>> {
        return readonly(this.order);
    }

    public async setOrder(orderId: number): Promise<void> {
        this.order.value = await OrdersRepository.findByIdWithRelations(orderId);
    }

    public clear(): void {
        this.order.value = null;
    }

    public async refresh(): Promise<void> {
        if (!this.order.value || !this.order.value.id) {
            throw new Error('Order not found');
        }

        await this.setOrder(this.order.value.id);
    }

    public async updateQty(item: OrderItem, qty: number): Promise<void> {
        await OrderItemsRepository.setQtyById(item.id as number, qty);
        await this.refresh();
    }
}

export const useSelectedOrder: SelectedOrderComposable = new SelectedOrderComposable();
