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
import { computed, type ComputedRef, ref, type Ref } from 'vue';
import type { Product } from '../../types/schema/product';
import { ProductsComposable } from '../../composables/products-composable';
import { lucide } from '../../utils/icons';
import { useNavigation } from '../../composables/useNavigation';
import ProductListComponent from '../../components/ProductListComponent.vue';
import ProductShowPage from './ProductShowPage.vue';
import HeaderComponent from '../../components/HeaderComponent.vue';


// --- Component logic ---
const { navigateTo } = useNavigation();

const productsFromStore = ProductsComposable.getList();

const selectedProduct: Ref<Product | null> = ref<Product | null>(null);

const products: ComputedRef<Product[]> = computed(() =>
    productsFromStore.value.map(
        (p: Product): Product => ({
            ...p,
            product_category: { ...p.product_category },
        }),
    ),
);

function onSelectProduct(product: Product): void {
    selectedProduct.value = selectedProduct.value?.id === product.id ? null : product;
}

function onViewTap(): void {
    if (!selectedProduct.value) return;
    navigateTo(ProductShowPage, {
        props: { product: selectedProduct.value },
        transition: { name: 'slideLeft', duration: 300 },
    });
}
</script>
