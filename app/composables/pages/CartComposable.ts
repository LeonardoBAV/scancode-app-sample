// --- Imports ---
import { computed, type ComputedRef } from 'vue';
import { Dialogs } from '@nativescript/core';
import type { OrderItem } from '../../types/schema/order-item';
import { showToast } from '../toast-state';
import { useSelectedOrder } from '../shared-state/SelectedOrderComposable';
import { PageComposable } from './PageComposable';
import { useTranslation } from '../useTranslation';


class CartComposable extends PageComposable {
    private readonly t: (key: string) => string = useTranslation().t;
    
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

    public async decreaseQty(orderItem: OrderItem): Promise<void> {

        if(this.canNotEditCart.value) {
            return;
        }

        if(orderItem.id == null) {
            return;
        }

        const nextQty: number = Math.max(0, orderItem.qty - 1);
        if(nextQty < 1) {
            const confirmed: boolean = await Dialogs.confirm({
                title: this.t('pages.cart.removeConfirmTitle'),
                message: this.t('pages.cart.removeConfirmMessage'),
                okButtonText: this.t('pages.cart.removeConfirmOk'),
                cancelButtonText: this.t('pages.cart.removeConfirmCancel'),
            });

            if(!confirmed) {
                return;
            }
        }

        this.isProcessing.value = true;
        try {
            await useSelectedOrder.updateQty(orderItem, nextQty);
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
