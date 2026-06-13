// --- Imports ---
import { computed, type ComputedRef } from 'vue';
import type { OrderItem } from '../../types/schema/order-item';
import type { Product } from '../../types/schema/product';
import { i18n } from '../../configs/i18n';
import { showToast } from '../toast-state';
import { useSelectedOrder } from '../shared-state/SelectedOrderComposable';
import { PageComposable } from './PageComposable';

const t = i18n.global.t;

class CartComposable extends PageComposable {

    public readonly canEditCart: ComputedRef<boolean> = computed((): boolean => {
        return useSelectedOrder.getOrder().value?.status === 'pending';
    });

    public readonly canNotEditCart: ComputedRef<boolean> = computed((): boolean => {
        return !this.canEditCart.value;
    });

    public readonly cartItems: ComputedRef<readonly OrderItem[]> = computed((): readonly OrderItem[] => {
        return useSelectedOrder.getOrder().value?.order_items ?? [];
    });

    public async addProduct(product: Product): Promise<void> {
        if (this.isProductInCart(product)) {
            showToast({ message: t('pages.cart.alreadyInCart'), variant: 'error' });
            return;
        }

        try {
            await useSelectedOrder.createOrderItem(product, 1);
        } catch (error: unknown) {
            this.handleProcessingError(error);
        }
    }

    public async increaseQty(orderItem: OrderItem): Promise<void> {
        try {
            await useSelectedOrder.updateQty(orderItem, orderItem.qty + 1);
        } catch (error: unknown) {
            this.handleProcessingError(error);
        }
    }

    public async decreaseQty(orderItem: OrderItem): Promise<void> {
        try {
            await useSelectedOrder.updateQty(orderItem, Math.max(0, orderItem.qty - 1));
        } catch (error: unknown) {
            this.handleProcessingError(error);
        }
    }

    private isProductInCart(product: Product): boolean {
        const productId: number = product.id as number;
        return this.cartItems.value.some((c: OrderItem): boolean => c.product_id === productId);
    }

    private handleProcessingError(error: unknown): void {
        console.error(error);
        const message: string = error instanceof Error ? error.message : String(error);
        showToast({ message, variant: 'error' });
    }
}

export const useCart: CartComposable = new CartComposable();
