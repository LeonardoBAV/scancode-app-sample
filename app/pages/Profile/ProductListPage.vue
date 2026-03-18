<template>
    <Page actionBarHidden="true">
        <GridLayout :rows="selectedProduct ? 'auto, *, auto' : 'auto, *'" class="bg-background">
            <HeaderComponent row="0" :title="$t('pages.productList.title')" :showAvatar="false" />
            <ProductListComponent row="1" :products="products" :selected-product-id="selectedProduct?.id ?? null" @select="onSelectProduct" />

            <StackLayout v-if="selectedProduct" row="2" class="footer-bar">
                <Button :text="lucide('eye')" class="btn-icon lucide" @tap="onViewTap" />
            </StackLayout>
        </GridLayout>
    </Page>
</template>

<script setup lang="ts">
// --- Imports ---
import { ref, getCurrentInstance } from 'vue';
import type { Product } from '../../types/product';
import type { ProductCategory } from '../../types/product-category';
import { lucide } from '../../utils/icons';
import ProductListComponent from '../../components/ProductListComponent.vue';
import ProductShowPage from './ProductShowPage.vue';
import HeaderComponent from '../../components/HeaderComponent.vue';


// --- Component logic ---
const instance = getCurrentInstance();
const navigateTo = instance?.appContext.config.globalProperties.$navigateTo as (
    target: unknown,
    options?: Record<string, unknown>
) => void;

const selectedProduct = ref<Product | null>(null);

function onSelectProduct(product: Product): void {
    selectedProduct.value = selectedProduct.value?.id === product.id ? null : product;
}

function onViewTap(): void {
    if (!selectedProduct.value) return;
    navigateTo?.(ProductShowPage, {
        props: { product: selectedProduct.value },
        transition: { name: 'slideLeft', duration: 300 },
    });
}

const beverages: ProductCategory = { id: 1, name: 'Beverages' };
const snacks: ProductCategory = { id: 2, name: 'Snacks' };
const dairy: ProductCategory = { id: 3, name: 'Dairy' };

const products = ref<Product[]>([
    { id: 1, sku: 'BEV-001', barcode: '7891000012345', name: 'Mineral Water 500ml', price: 2.5, product_category_id: 1, product_category: beverages },
    { id: 2, sku: 'SNK-001', barcode: '7891000012346', name: 'Chips 150g', price: 8.9, product_category_id: 2, product_category: snacks },
    { id: 3, sku: 'DRY-001', barcode: '7891000012347', name: 'Milk 1L', price: 5.2, product_category_id: 3, product_category: dairy },
    { id: 4, sku: 'BEV-002', barcode: '7891000012348', name: 'Soda 350ml', price: 3.75, product_category_id: 1, product_category: beverages },
    { id: 5, sku: 'SNK-002', barcode: '7891000012349', name: 'Cookie pack', price: 6.0, product_category_id: 2, product_category: snacks },
    { id: 6, sku: 'BEV-003', barcode: '7891000012350', name: 'Orange juice 1L', price: 7.9, product_category_id: 1, product_category: beverages },
    { id: 7, sku: 'DRY-002', barcode: '7891000012351', name: 'Yogurt 170g', price: 3.2, product_category_id: 3, product_category: dairy },
    { id: 8, sku: 'SNK-003', barcode: '7891000012352', name: 'Peanuts 200g', price: 5.5, product_category_id: 2, product_category: snacks },
    { id: 9, sku: 'BEV-004', barcode: '7891000012353', name: 'Energy drink 250ml', price: 6.5, product_category_id: 1, product_category: beverages },
    { id: 10, sku: 'DRY-003', barcode: '7891000012354', name: 'Cheese 200g', price: 12.9, product_category_id: 3, product_category: dairy },
    { id: 11, sku: 'SNK-004', barcode: '7891000012355', name: 'Chocolate bar 90g', price: 4.8, product_category_id: 2, product_category: snacks },
    { id: 12, sku: 'BEV-005', barcode: '7891000012356', name: 'Iced tea 330ml', price: 3.5, product_category_id: 1, product_category: beverages },
    { id: 13, sku: 'DRY-004', barcode: '7891000012357', name: 'Butter 200g', price: 9.0, product_category_id: 3, product_category: dairy },
    { id: 14, sku: 'SNK-005', barcode: '7891000012358', name: 'Crackers 140g', price: 4.2, product_category_id: 2, product_category: snacks },
    { id: 15, sku: 'BEV-006', barcode: '7891000012359', name: 'Coffee 200ml', price: 5.0, product_category_id: 1, product_category: beverages },
    { id: 16, sku: 'DRY-005', barcode: '7891000012360', name: 'Cream cheese 150g', price: 8.5, product_category_id: 3, product_category: dairy },
    { id: 17, sku: 'SNK-006', barcode: '7891000012361', name: 'Popcorn 80g', price: 3.9, product_category_id: 2, product_category: snacks },
    { id: 18, sku: 'BEV-007', barcode: '7891000012362', name: 'Lemonade 500ml', price: 4.5, product_category_id: 1, product_category: beverages },
    { id: 19, sku: 'DRY-006', barcode: '7891000012363', name: 'Cottage cheese 200g', price: 6.8, product_category_id: 3, product_category: dairy },
    { id: 20, sku: 'SNK-007', barcode: '7891000012364', name: 'Nuts mix 100g', price: 11.0, product_category_id: 2, product_category: snacks },
]);
</script>
