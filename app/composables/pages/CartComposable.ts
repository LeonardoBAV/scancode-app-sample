// --- Imports ---
import { computed, type ComputedRef } from 'vue';
import type { OrderItem } from '../../types/schema/order-item';
import { useSelectedOrder } from '../shared-state/SelectedOrderComposable';
import { PageComposable } from './PageComposable';


class CartComposable extends PageComposable {
    
    public readonly canEditCart: ComputedRef<boolean> = computed((): boolean => {
        return useSelectedOrder.getOrder().value?.status === 'pending';
    });

    public readonly canNotEditCart: ComputedRef<boolean> = computed((): boolean => {
        return !this.canEditCart.value;
    });

    public async increaseQty(item: OrderItem): Promise<void> {

        if(this.canNotEditCart.value) {
            return;
        }

        this.isProcessing.value = true;
        try {
            await useSelectedOrder.updateQty(item, item.qty + 1);
        } finally {
            this.isProcessing.value = false;
        }
    }
}

export const useCart: CartComposable = new CartComposable();
