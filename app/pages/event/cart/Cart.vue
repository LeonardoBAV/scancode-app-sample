<template>
    <Page actionBarHidden="true">
        <GridLayout rows="auto, auto, *, auto" class="bg-background">
            <!-- Header -->
            <HeaderComponent row="0" :title="$t('pages.cart.title')" />

            <!-- Search -->
            <StackLayout v-if="hasSelectedOrder && canEditCart" row="1" class="px-4 pt-4 pb-2">
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
                            <GridLayout v-if="canEditCart" row="2" col="0" colSpan="2" rows="auto" columns="auto, auto, auto" class="mt-3">
                                <Button col="0" text="−" class="btn-icon-sm bg-secondary text-secondary-foreground" @tap="decreaseQty(item)" />
                                <Label col="1" :text="String(item.qty)" class="text-base font-semibold text-foreground text-center min-w-8 mx-2" verticalAlignment="center" />
                                <Button col="2" text="+" class="btn-icon-sm bg-primary text-primary-foreground" @tap="increaseQty(item)" />
                            </GridLayout>
                            <Label v-else row="2" col="0" colSpan="2" :text="String(item.qty)" class="text-base font-semibold text-foreground mt-3" />
                        </GridLayout>
                    </template>
                </ListView>
            </GridLayout>

            <!-- Footer -->
            <StackLayout v-if="hasSelectedOrder" row="3" class="footer-bar">
                <GridLayout rows="auto, auto, auto" columns="*, auto">
                    <Button
                        v-if="canEditCart"
                        row="0"
                        col="1"
                        rowSpan="3"
                        :text="Icons.lucide('camera')"
                        class="lucide btn-icon bg-secondary text-secondary-foreground w-12 h-12"
                        verticalAlignment="center"
                        @tap="onCameraTap"
                    />
                    <Label row="1" col="0" :text="Format.formatCurrencyBR(cartTotal)" class="text-2xl font-bold text-success" />
                    <Label row="2" col="0" :text="footerStatsLabel" class="text-sm text-muted-foreground mt-1" />
                </GridLayout>
            </StackLayout>
        </GridLayout>
    </Page>
</template>

<script setup lang="ts">
// --- Imports ---
import { ref, computed, type Ref, type ComputedRef } from 'vue';
import { type TextField } from '@nativescript/core';
import { BarcodeScanner } from 'nativescript-barcodescanner';
import { useTranslation } from '../../../composables/useTranslation';
import { useSelectedOrder } from '../../../composables/shared-state/SelectedOrderComposable';
import { ProductsComposable } from '../../../composables/products-composable';
import HeaderComponent from '../../../components/HeaderComponent.vue';
import { Haptics } from '../../../utils/haptics';
import { Format } from '../../../utils/format';
import type { Product } from '../../../types/schema/product';
import type { OrderItem } from '../../../types/schema/order-item';
import { Icons } from '../../../utils/icons';
import { OrderItemsRepository } from '../../../db/repositories/order-items.repo';
import { showToast } from '../../../composables/toast-state';
import { useCart } from '../../../composables/pages/CartComposable';


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

const productCountLabel: ComputedRef<string> = computed((): string => {
    const count: number = cartItems.value.length;
    return count === 1 ? `1 ${t('pages.cart.product')}` : `${count} ${t('pages.cart.products')}`;
});

const totalQuantityLabel: ComputedRef<string> = computed((): string => {
    const count: number = cartItems.value.reduce((sum: number, item: OrderItem): number => sum + item.qty, 0);
    return count === 1 ? `1 ${t('pages.cart.item')}` : `${count} ${t('pages.cart.items')}`;
});

const footerStatsLabel: ComputedRef<string> = computed((): string => `${productCountLabel.value} · ${totalQuantityLabel.value}`);

function isScanCancelled(error: unknown): boolean {
    const message: string = error instanceof Error ? error.message : String(error);
    return message.includes('Scan aborted') || message.includes('abort');
}

async function ensureCameraPermission(scanner: BarcodeScanner): Promise<boolean> {
    const hasPermission: boolean = await scanner.hasCameraPermission();
    if (hasPermission) {
        return true;
    }
    try {
        await scanner.requestCameraPermission();
    } catch {
        showToast({ message: t('pages.cart.scanPermissionDenied'), variant: 'error' });
        return false;
    }
    const granted: boolean = await scanner.hasCameraPermission();
    if (!granted) {
        showToast({ message: t('pages.cart.scanPermissionDenied'), variant: 'error' });
    }
    return granted;
}

async function onCameraTap(): Promise<void> {
    console.log('onCameraTap');
    if (!canEditCart.value) {
        return;
    }
    const scanner: BarcodeScanner = new BarcodeScanner();
    const cameraAvailable: boolean = await scanner.available();
    console.log('cameraAvailable', cameraAvailable);
    if (!cameraAvailable) {
        showToast({ message: t('pages.cart.scanCameraUnavailable'), variant: 'error' });
        return;
    }
    const hasPermission: boolean = await ensureCameraPermission(scanner);
    if (!hasPermission) {
        return;
    }
    try {
        const result = await scanner.scan({
            formats: 'EAN_13, EAN_8, UPC_A, UPC_E, CODE_128, CODE_39, ITF',
            cancelLabel: t('pages.cart.scanCancel'),
            message: t('pages.cart.scanMessage'),
            preferFrontCamera: false,
            showFlipCameraButton: false,
            showTorchButton: true,
            torchOn: false,
            resultDisplayDuration: 0,
            openSettingsIfPermissionWasPreviouslyDenied: true,
        });
        console.log('result', result);

        const scannedCode: string = result.text.trim();
        if (!scannedCode) {
            return;
        }

        const found: Product | undefined = ProductsComposable.getList().value.find(
            (p: Product): boolean => !!p.barcode && p.barcode.trim() === scannedCode
        );

        if (found == null) {
            showToast({ message: t('pages.cart.scanNotFound'), variant: 'error' });
            return;
        }

        await addProduct(found);
        Haptics.vibrateSuccess();
    } catch (error: unknown) {
        if (isScanCancelled(error)) {
            return;
        }
        const message: string = error instanceof Error ? error.message : String(error);
        if (message.toLowerCase().includes('camera') || message.toLowerCase().includes('permission')) {
            showToast({ message: t('pages.cart.scanPermissionDenied'), variant: 'error' });
            return;
        }
        showToast({ message: t('pages.cart.scanError'), variant: 'error' });
    }
}

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
    await useSelectedOrder.refresh();
}

function getSelectedOrderId(): number {
    const orderId: number = (orderRef.value?.id) as number;
    return orderId;
}

async function addProduct(product: Product): Promise<void> {
    if (!canEditCart.value) {
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
    await useCart.increaseQty(item);
}

async function decreaseQty(item: OrderItem): Promise<void> {
    await useCart.decreaseQty(item);
}

const orderRef = useSelectedOrder.getOrder();
const hasSelectedOrder: ComputedRef<boolean> = computed((): boolean => orderRef.value != null);
const canEditCart: ComputedRef<boolean> = useCart.canEditCart;

const cartItems: ComputedRef<readonly OrderItem[]> = computed((): readonly OrderItem[] => orderRef.value?.order_items ?? []);
</script>
