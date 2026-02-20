<template>
    <Page>
        <ActionBar title="Product list">
            <NavigationButton text="Back" android.systemIcon="ic_menu_back" @tap="goBack" />
        </ActionBar>
        <ListView :items="products" separatorColor="transparent" class="list">
            <template #default="{ item }">
                <GridLayout rows="auto, auto, auto" columns="*, auto" class="product-item p-3 m-2 rounded-lg border border-gray-200">
                    <Label row="0" col="0" colSpan="2" :text="item.name" class="text-base font-bold text-gray-900" textWrap="true" />
                    <Label row="1" col="0" :text="'SKU: ' + item.sku" class="text-sm text-gray-600 mt-1" textWrap="true" />
                    <Label row="1" col="1" :text="formatPrice(item.price)" class="text-sm font-semibold text-gray-900 mt-1" horizontalAlignment="right" />
                    <Label row="2" col="0" colSpan="2" :text="item.product_category.name" class="text-xs text-gray-500 mt-1" textWrap="true" />
                </GridLayout>
            </template>
        </ListView>
    </Page>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue';
import type { Product } from '../../types/product';
import type { ProductCategory } from '../../types/product-category';

const beverages: ProductCategory = { id: 1, name: 'Beverages' };
const snacks: ProductCategory = { id: 2, name: 'Snacks' };
const dairy: ProductCategory = { id: 3, name: 'Dairy' };

const products = ref<Product[]>([
    { id: 1, sku: 'BEV-001', barcode: '7891000012345', name: 'Mineral Water 500ml', price: 2.5, product_category_id: 1, product_category: beverages },
    { id: 2, sku: 'SNK-001', barcode: '7891000012346', name: 'Chips 150g', price: 8.9, product_category_id: 2, product_category: snacks },
    { id: 3, sku: 'DRY-001', barcode: '7891000012347', name: 'Milk 1L', price: 5.2, product_category_id: 3, product_category: dairy },
    { id: 4, sku: 'BEV-002', barcode: '7891000012348', name: 'Soda 350ml', price: 3.75, product_category_id: 1, product_category: beverages },
    { id: 5, sku: 'SNK-002', barcode: '7891000012349', name: 'Cookie pack', price: 6.0, product_category_id: 2, product_category: snacks },
]);

const instance = getCurrentInstance();
const globals = instance?.appContext.config.globalProperties;
const navigateBack = globals?.$navigateBack as () => Promise<void> | void;

function formatPrice(price: number): string {
    return 'R$ ' + price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function goBack(): void {
    return navigateBack?.();
}
</script>

<style scoped>
.product-item {
    background-color: #fafafa;
}
</style>
