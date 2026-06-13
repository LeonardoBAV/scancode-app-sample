// --- Imports ---
import { computed, type ComputedRef } from 'vue';
import type { OrderItem } from '../../types/schema/order-item';
import type { Product } from '../../types/schema/product';
import { i18n } from '../../configs/i18n';
import { OrderItemsRepository } from '../../db/repositories/order-items.repo';
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

        await OrderItemsRepository.createOne({
            order_id: useSelectedOrder.getOrder().value?.id as number,
            product_id: product.id as number,
            price: product.price,
            qty: 1,
            notes: null,
        });
        await useSelectedOrder.refresh();
    }

    public async increaseQty(orderItem: OrderItem): Promise<void> {
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

    public async decreaseQty(orderItem: OrderItem): Promise<void> {
        this.isProcessing.value = true;
        try {
            await useSelectedOrder.updateQty(orderItem, Math.max(0, orderItem.qty - 1));
        } catch (error: unknown) {
            console.error(error);
            const message: string = error instanceof Error ? error.message : String(error);
            showToast({ message, variant: 'error' });
        } finally {
            this.isProcessing.value = false;
        }
    }

    private isProductInCart(product: Product): boolean {
        const productId: number = product.id as number;
        return this.cartItems.value.some((c: OrderItem): boolean => c.product_id === productId);
    }
}

export const useCart: CartComposable = new CartComposable();
