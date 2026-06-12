// --- Imports ---
import { computed, type ComputedRef } from 'vue';
import type { OrderItem } from '../../types/schema/order-item';
import { showToast } from '../toast-state';
import { useSelectedOrder } from '../shared-state/SelectedOrderComposable';
import { PageComposable } from './PageComposable';


class CartComposable extends PageComposable {
    
    public readonly canEditCart: ComputedRef<boolean> = computed((): boolean => {
        return useSelectedOrder.getOrder().value?.status === 'pending';
    });

    public readonly canNotEditCart: ComputedRef<boolean> = computed((): boolean => {
        return !this.canEditCart.value;
    });

    public async increaseQty(orderItem: OrderItem): Promise<void> {

        if(this.canNotEditCart.value) {
            return;
        }

        this.isProcessing.value = true;
        try {
            await useSelectedOrder.updateQty(orderItem, orderItem.qty + 1);
        } catch (error: unknown) {
            console.error(error);
            const message: string = error instanceof Error ? error.message : String(error);
            showToast({ message, variant: 'error' });
        } finally {
            this.isProcessing.value = false;
        }
    }
}

export const useCart: CartComposable = new CartComposable();
