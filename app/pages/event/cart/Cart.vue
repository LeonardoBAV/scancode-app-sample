<template>
    <Page actionBarHidden="true">
        <GridLayout rows="auto, auto, *, auto" class="bg-background">
            <!-- Header -->
            <HeaderComponent row="0" :title="$t('pages.cart.title')" />

            <!-- Search -->
            <StackLayout v-if="hasSelectedOrder && canEditOrder" row="1" class="px-4 pt-4 pb-2">
                <GridLayout columns="auto, *" class="input-search">
                    <Label col="0" :text="Icons.lucide('search')" class="lucide text-muted-foreground mr-3" verticalAlignment="center" />
                    <TextField ref="searchFieldRef" col="1" v-model="searchQuery" :hint="$t('pages.cart.searchHint')" class="text-base text-foreground p-0" placeholderColor="#71717a" />
                </GridLayout>
                <ListView v-if="searchQuery.length > 0 && searchResults.length > 0" :items="searchResults" separatorColor="transparent" class="mt-2 rounded-xl border border-border bg-card" height="180">
                    <template #default="{ item }">
                        <GridLayout rows="auto, auto" columns="*, auto" class="p-4 border-b border-border" @tap="selecctedProduct(item)">
                            <Label row="0" col="0" :text="item.name" class="text-base font-semibold text-card-foreground" textWrap="true" />
                            <Label row="1" col="0" :text="item.sku + ' · ' + item.product_category.name" class="text-xs text-muted-foreground mt-1" />
                            <Label row="0" col="1" rowSpan="2" :text="Format.formatCurrencyBR(item.price)" class="text-base font-bold text-success" verticalAlignment="center" />
                        </GridLayout>
                    </template>
                </ListView>
            </StackLayout>

            <!-- Cart list or empty state -->
            <GridLayout row="2" rows="*">
                <StackLayout v-if="!hasSelectedOrder" class="p-8" verticalAlignment="center" horizontalAlignment="center">
                    <Label :text="Icons.lucide('shopping-cart')" class="lucide text-4xl text-muted-foreground mb-4" horizontalAlignment="center" />
                    <Label :text="$t('pages.cart.noOrderTitle')" class="text-lg font-semibold text-foreground text-center mb-2" />
                    <Label :text="$t('pages.cart.noOrderHint')" class="text-sm text-muted-foreground text-center" textWrap="true" />
                </StackLayout>
                <StackLayout v-else-if="cartItems.length === 0" class="p-8" verticalAlignment="center" horizontalAlignment="center">
                    <Label :text="Icons.lucide('shopping-cart')" class="lucide text-4xl text-muted-foreground mb-4" />
                    <Label :text="$t('pages.cart.empty')" class="text-lg font-semibold text-foreground text-center mb-2" />
                    <Label :text="$t('pages.cart.emptyHint')" class="text-sm text-muted-foreground text-center" textWrap="true" />
                </StackLayout>
                <ListView v-else :items="cartItems" separatorColor="transparent" class="bg-background">
                    <template #default="{ item }">
                        <GridLayout rows="auto, auto, auto" columns="*, auto" class="card m-2 mx-4" androidElevation="2">
                            <Label row="0" col="0" :text="item.product?.name ?? ''" class="text-base font-semibold text-card-foreground" textWrap="true" />
                            <Label row="0" col="1" :text="Format.formatCurrencyBR(item.price * item.qty)" class="text-base font-bold text-success" verticalAlignment="top" />
                            <Label row="1" col="0" :text="(item.product?.sku ?? '') + ' · ' + (item.product?.product_category?.name ?? '')" class="text-xs text-muted-foreground mt-1" />
                            <Label row="1" col="1" :text="Format.formatCurrencyBR(item.price) + ' ' + perUnitLabel" class="text-xs text-muted-foreground" verticalAlignment="center" />
                            <GridLayout row="2" col="0" colSpan="2" rows="auto" columns="auto, auto, auto" class="mt-3">
                                <Button col="0" text="−" class="btn-icon-sm bg-secondary text-secondary-foreground" :isEnabled="canEditOrder" @tap="decreaseQty(item)" />
                                <Label col="1" :text="String(item.qty)" class="text-base font-semibold text-foreground text-center min-w-8 mx-2" verticalAlignment="center" />
                                <Button col="2" text="+" class="btn-icon-sm bg-primary text-primary-foreground" :isEnabled="canEditOrder" @tap="increaseQty(item)" />
                            </GridLayout>
                        </GridLayout>
                    </template>
                </ListView>
            </GridLayout>

            <!-- Footer -->
            <GridLayout v-if="hasSelectedOrder" row="3" rows="auto" columns="*, *" class="footer-bar">
                <Label col="0" :text="totalItemsLabel" class="text-base font-semibold text-foreground" verticalAlignment="center" />
                <Label col="1" :text="Format.formatCurrencyBR(cartTotal)" class="text-xl font-bold text-success text-right" verticalAlignment="center" />
            </GridLayout>
        </GridLayout>
    </Page>
</template>

<script setup lang="ts">
// --- Imports ---
import { ref, computed, type Ref, type ComputedRef } from 'vue';
import { Dialogs, type TextField } from '@nativescript/core';
import { useTranslation } from '../../../composables/useTranslation';
import { useCurrentOrder } from '../../../composables/repository/useCurrentOrder';
import { ProductsComposable } from '../../../composables/products-composable';
import HeaderComponent from '../../../components/HeaderComponent.vue';
import { Haptics } from '../../../utils/haptics';
import { Format } from '../../../utils/format';
import type { Product } from '../../../types/schema/product';
import type { OrderItem } from '../../../types/schema/order-item';
import { Icons } from '../../../utils/icons';
import { OrderItemsRepository } from '../../../db/repositories/order-items.repo';


// --- Component logic ---
const { t }: { t: (key: string) => string } = useTranslation();
const perUnitLabel: string = t('pages.cart.perUnit');

const searchQuery: Ref<string> = ref('');
const searchFieldRef: Ref<{ nativeView?: TextField } | null> = ref(null);

const searchResults: ComputedRef<Product[]> = computed((): Product[] => {
    const term: string = searchQuery.value.trim().toLowerCase();
    if (!term) return [];
    return ProductsComposable.getList().value.filter(
        (p: Product): boolean => p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term)
    );
});

const cartTotal: ComputedRef<number> = computed((): number =>
    cartItems.value.reduce((sum: number, item: OrderItem): number => sum + item.price * item.qty, 0)
);

const totalItemsLabel: ComputedRef<string> = computed((): string => {
    const count: number = cartItems.value.reduce((sum: number, item: OrderItem): number => sum + item.qty, 0);
    return count === 1 ? `1 ${t('pages.cart.item')}` : `${count} ${t('pages.cart.items')}`;
});

function closeKeyboard(): void {
    setTimeout((): void => {
        searchFieldRef.value?.nativeView?.dismissSoftInput();
    }, 50);
}

function isProductInCart(product: Product): boolean {
    if (product.id == null) {
        return false;
    }
    const productId: number = product.id;
    return cartItems.value.some((c: OrderItem): boolean => c.product_id === productId);
}

async function refreshOrder(): Promise<void> {
    await useCurrentOrder.refresh();
}

function getSelectedOrderId(): number {
    const orderId: number = (orderRef.value?.id) as number;
    return orderId;
}

async function removeProductFromCart(product: Product): Promise<void> {
    if (!canEditOrder.value) {
        return;
    }
    if (product.id == null) {
        return;
    }
    const productId: number = product.id;
    const existing: OrderItem | undefined = cartItems.value.find((c: OrderItem): boolean => c.product_id === productId);
    if (existing == null || existing.id == null) {
        return;
    }
    const orderItemId: number = existing.id;
    await OrderItemsRepository.deleteById(orderItemId);
    await refreshOrder();
}

async function addProduct(product: Product): Promise<void> {
    if (!canEditOrder.value) {
        return;
    }
    const orderId: number = getSelectedOrderId();
    if (product.id == null) {
        return;
    }
    const productId: number = product.id;
    const existing: OrderItem | undefined = cartItems.value.find((c: OrderItem): boolean => c.product_id === productId);
    if (existing?.id != null) {
        await OrderItemsRepository.setQtyById(existing.id, existing.qty + 1);
        await refreshOrder();
        return;
    }
    await OrderItemsRepository.createOne({
        order_id: orderId,
        product_id: productId,
        price: product.price,
        qty: 1,
        notes: null,
    });
    await refreshOrder();
}

function selecctedProduct(product: Product): void {
    void addProduct(product);

    closeKeyboard();
    Haptics.vibrateSuccess();
    searchQuery.value = '';
}

async function increaseQty(item: OrderItem): Promise<void> {
    if (!canEditOrder.value) {
        return;
    }
    if (item.id == null) {
        return;
    }
    await OrderItemsRepository.setQtyById(item.id, item.qty + 1);
    await refreshOrder();
}

async function decreaseQty(item: OrderItem): Promise<void> {
    if (!canEditOrder.value) {
        return;
    }
    if (item.id == null) {
        return;
    }
    if (item.qty > 1) {
        await OrderItemsRepository.setQtyById(item.id, item.qty - 1);
        await refreshOrder();
        return;
    }
    const confirmed: boolean = await Dialogs.confirm({
        title: t('pages.cart.removeConfirmTitle'),
        message: t('pages.cart.removeConfirmMessage'),
        okButtonText: t('pages.cart.removeConfirmOk'),
        cancelButtonText: t('pages.cart.removeConfirmCancel'),
    });
    if (confirmed) {
        const product: Product | null | undefined = item.product;
        if (product != null) {
            await removeProductFromCart(product);
        }
    }
}

const orderRef = useCurrentOrder.getOrder();
const hasSelectedOrder: ComputedRef<boolean> = computed((): boolean => orderRef.value != null);
const canEditOrder: ComputedRef<boolean> = computed((): boolean => orderRef.value?.status === 'pending');

const cartItems: ComputedRef<readonly OrderItem[]> = computed((): readonly OrderItem[] => orderRef.value?.order_items ?? []);
</script>
