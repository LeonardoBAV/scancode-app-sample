// --- Imports ---
import { computed, type ComputedRef } from 'vue';
import type { OrderItem } from '../../types/schema/order-item';
import { OrderItemsRepository } from '../../db/repositories/order-items.repo';
import { useSelectedOrder } from '../shared-state/SelectedOrderComposable';
import { PageComposable } from './PageComposable';


class CartComposable extends PageComposable {
    public readonly canEditCart: ComputedRef<boolean> = computed((): boolean => {
        return useSelectedOrder.getOrder().value?.status === 'pending';
    });

    public async increaseQty(item: OrderItem): Promise<void> {
        this.isProcessing.value = true;
        try {
            await OrderItemsRepository.setQtyById(item.id as number, item.qty + 1);
            await useSelectedOrder.refresh();
        } finally {
            this.isProcessing.value = false;
        }
    }
}

export const useCart: CartComposable = new CartComposable();
