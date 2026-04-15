<template>
    <Page actionBarHidden="true">
        <GridLayout rows="auto, auto, *, auto" class="bg-background">
            <!-- Header -->
            <HeaderComponent row="0" :title="$t('pages.cart.title')" />

            <!-- Search -->
            <StackLayout row="1" class="px-4 pt-4 pb-2">
                <GridLayout columns="auto, *" class="input-search">
                    <Label col="0" :text="lucide('search')" class="lucide text-muted-foreground mr-3" verticalAlignment="center" />
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
                <StackLayout v-if="cartItems.length === 0" class="p-8" verticalAlignment="center" horizontalAlignment="center">
                    <Label :text="lucide('shopping-cart')" class="lucide text-4xl text-muted-foreground mb-4" />
                    <Label :text="$t('pages.cart.empty')" class="text-lg font-semibold text-foreground text-center mb-2" />
                    <Label :text="$t('pages.cart.emptyHint')" class="text-sm text-muted-foreground text-center" textWrap="true" />
                </StackLayout>
                <ListView v-else :items="cartItems" separatorColor="transparent" class="bg-background">
                    <template #default="{ item }">
                        <GridLayout rows="auto, auto, auto" columns="*, auto" class="card m-2 mx-4" androidElevation="2">
                            <Label row="0" col="0" :text="item.product.name" class="text-base font-semibold text-card-foreground" textWrap="true" />
                            <Label row="0" col="1" :text="Format.formatCurrencyBR(item.product.price * item.quantity)" class="text-base font-bold text-success" verticalAlignment="top" />
                            <Label row="1" col="0" :text="item.product.sku + ' · ' + item.product.product_category.name" class="text-xs text-muted-foreground mt-1" />
                            <Label row="1" col="1" :text="Format.formatCurrencyBR(item.product.price) + ' ' + perUnitLabel" class="text-xs text-muted-foreground" verticalAlignment="center" />
                            <GridLayout row="2" col="0" colSpan="2" rows="auto" columns="auto, auto, auto" class="mt-3">
                                <Button col="0" text="−" class="btn-icon-sm bg-secondary text-secondary-foreground" @tap="decreaseQty(item)" />
                                <Label col="1" :text="String(item.quantity)" class="text-base font-semibold text-foreground text-center min-w-8 mx-2" verticalAlignment="center" />
                                <Button col="2" text="+" class="btn-icon-sm bg-primary text-primary-foreground" @tap="increaseQty(item)" />
                            </GridLayout>
                        </GridLayout>
                    </template>
                </ListView>
            </GridLayout>

            <!-- Footer -->
            <GridLayout row="3" rows="auto" columns="*, *" class="footer-bar">
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
import HeaderComponent from '../../../components/HeaderComponent.vue';
import { vibrateSuccess } from '../../../utils/haptics';
import { Format } from '../../../utils/format';
import type { Product } from '../../../types/schema/product';
import type { CartItem } from '../../../types/cart';
import { lucide } from '../../../utils/icons';


// --- Component logic ---
const { t }: { t: (key: string) => string } = useTranslation();
const perUnitLabel: string = t('pages.cart.perUnit');

const searchQuery: Ref<string> = ref('');
const searchFieldRef: Ref<{ nativeView?: TextField } | null> = ref(null);

const searchResults: ComputedRef<Product[]> = computed((): Product[] => {
    const term: string = searchQuery.value.trim().toLowerCase();
    if (!term) return [];
    return allProducts.value.filter(
        (p: Product): boolean => p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term)
    );
});

const cartTotal: ComputedRef<number> = computed((): number =>
    cartItems.value.reduce((sum: number, item: CartItem): number => sum + item.product.price * item.quantity, 0)
);

const totalItemsLabel: ComputedRef<string> = computed((): string => {
    const count: number = cartItems.value.reduce((sum: number, item: CartItem): number => sum + item.quantity, 0);
    return count === 1 ? `1 ${t('pages.cart.item')}` : `${count} ${t('pages.cart.items')}`;
});

function closeKeyboard(): void {
    setTimeout((): void => {
        searchFieldRef.value?.nativeView?.dismissSoftInput();
    }, 50);
}

function isProductInCart(product: Product): boolean {
    return cartItems.value.some((c: CartItem): boolean => c.product.id === product.id);
}

function removeProductFromCart(product: Product): void {
    cartItems.value = cartItems.value.filter((i: CartItem): boolean => i.product.id !== product.id);
}

function addProduct(product: Product): void {
    if (!isProductInCart(product)) {
        cartItems.value.push({ product, quantity: 1 });
    }
}

function selecctedProduct(product: Product): void {
    addProduct(product);

    closeKeyboard();
    vibrateSuccess();
    searchQuery.value = '';
}

function increaseQty(item: CartItem): void {
    item.quantity++;
}

async function decreaseQty(item: CartItem): Promise<void> {
    if (item.quantity > 1) {
        item.quantity--;
        return;
    }
    const confirmed: boolean = await Dialogs.confirm({
        title: t('pages.cart.removeConfirmTitle'),
        message: t('pages.cart.removeConfirmMessage'),
        okButtonText: t('pages.cart.removeConfirmOk'),
        cancelButtonText: t('pages.cart.removeConfirmCancel'),
    });
    if (confirmed) {
        removeProductFromCart(item.product);
    }
}

const allProducts: Ref<Product[]> = ref<Product[]>([
    { id: 1, sku: 'SKU-001', barcode: '7891000100', name: 'Coca-Cola 350ml', price: 5.50, product_category_id: 1, product_category: { id: 1, name: 'Bebidas' } },
    { id: 2, sku: 'SKU-002', barcode: '7891000200', name: 'Guaraná Antarctica 350ml', price: 4.50, product_category_id: 1, product_category: { id: 1, name: 'Bebidas' } },
    { id: 3, sku: 'SKU-003', barcode: '7891000300', name: 'Água Mineral 500ml', price: 3.00, product_category_id: 1, product_category: { id: 1, name: 'Bebidas' } },
    { id: 4, sku: 'SKU-004', barcode: '7891000400', name: 'Suco de Laranja 1L', price: 8.90, product_category_id: 1, product_category: { id: 1, name: 'Bebidas' } },
    { id: 5, sku: 'SKU-005', barcode: '7891000500', name: 'Cerveja Pilsen 600ml', price: 12.00, product_category_id: 1, product_category: { id: 1, name: 'Bebidas' } },
    { id: 6, sku: 'SKU-010', barcode: '7891001000', name: 'Pão de Queijo 6un', price: 9.90, product_category_id: 2, product_category: { id: 2, name: 'Lanches' } },
    { id: 7, sku: 'SKU-011', barcode: '7891001100', name: 'Coxinha de Frango', price: 7.50, product_category_id: 2, product_category: { id: 2, name: 'Lanches' } },
    { id: 8, sku: 'SKU-012', barcode: '7891001200', name: 'Empada de Palmito', price: 6.00, product_category_id: 2, product_category: { id: 2, name: 'Lanches' } },
    { id: 9, sku: 'SKU-020', barcode: '7891002000', name: 'Bolo de Chocolate Fatia', price: 11.50, product_category_id: 3, product_category: { id: 3, name: 'Doces' } },
    { id: 10, sku: 'SKU-021', barcode: '7891002100', name: 'Brigadeiro Gourmet', price: 4.00, product_category_id: 3, product_category: { id: 3, name: 'Doces' } },
    { id: 11, sku: 'SKU-030', barcode: '7891003000', name: 'Parafuso Sextavado M8', price: 1.20, product_category_id: 4, product_category: { id: 4, name: 'Ferragens' } },
    { id: 12, sku: 'SKU-031', barcode: '7891003100', name: 'Prego 17x27 1kg', price: 18.90, product_category_id: 4, product_category: { id: 4, name: 'Ferragens' } },
    { id: 13, sku: 'SKU-040', barcode: '7891004000', name: 'Caderno Espiral 200fls', price: 22.00, product_category_id: 5, product_category: { id: 5, name: 'Papelaria' } },
    { id: 14, sku: 'SKU-041', barcode: '7891004100', name: 'Caneta Esferográfica Azul', price: 2.50, product_category_id: 5, product_category: { id: 5, name: 'Papelaria' } },
    { id: 15, sku: 'SKU-042', barcode: '7891004200', name: 'Resma Papel A4 500fls', price: 28.90, product_category_id: 5, product_category: { id: 5, name: 'Papelaria' } },
]);


const cartItems: Ref<CartItem[]> = ref<CartItem[]>([
    { product: allProducts.value[0], quantity: 2 },
    { product: allProducts.value[6], quantity: 3 },
    { product: allProducts.value[8], quantity: 1 },
]);
</script>
