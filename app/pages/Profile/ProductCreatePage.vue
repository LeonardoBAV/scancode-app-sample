<template>
    <Page actionBarHidden="true">
        <GridLayout rows="auto, *" class="bg-background">
            <HeaderComponent row="0" :title="$t('pages.productCreate.title')" :showAvatar="false" />

            <StackLayout v-if="loadState === 'loading'" row="1" class="p-8" verticalAlignment="center" horizontalAlignment="center">
                <Label :text="$t('common.loading')" class="text-base text-muted-foreground text-center" textWrap="true" />
            </StackLayout>

            <StackLayout v-else-if="loadState === 'error'" row="1" class="p-8" verticalAlignment="center" horizontalAlignment="center">
                <Label :text="$t('pages.productCreate.initError')" class="text-sm text-muted-foreground text-center" textWrap="true" />
            </StackLayout>

            <ProductFormComponent v-else-if="productDraft" row="1" :product="productDraft" :categories="categories" @save="createProduct" />
        </GridLayout>
    </Page>
</template>

<script setup lang="ts">
// --- Imports ---
import { onMounted, ref, type Ref } from 'vue';
import { ProductCategoriesRepository } from '../../db/repositories/product-categories.repo';
import { ProductsRepository } from '../../db/repositories/products.repo';
import { showToast } from '../../composables/toast-state';
import { useTranslation } from '../../composables/useTranslation';
import { useNavigation } from '../../composables/useNavigation';
import type { Product } from '../../types/schema/product';
import type { ProductCategory } from '../../types/schema/product-category';
import ProductFormComponent from '../../components/ProductFormComponent.vue';
import HeaderComponent from '../../components/HeaderComponent.vue';


// --- Component logic ---
type LoadState = 'loading' | 'ready' | 'error';

const { t } = useTranslation();
const { navigateBack } = useNavigation();

const loadState: Ref<LoadState> = ref<LoadState>('loading');
const categories: Ref<ProductCategory[]> = ref<ProductCategory[]>([]);
const productDraft: Ref<Product | null> = ref<Product | null>(null);

onMounted(async (): Promise<void> => {
    try {
        categories.value = await ProductCategoriesRepository.findAll();
        const first: ProductCategory | undefined = categories.value[0];
        if (!first) {
            loadState.value = 'error';
            return;
        }
        const now: string = new Date().toISOString();
        productDraft.value = {
            id: null,
            remote_id: null,
            is_sync: false,
            sku: '',
            barcode: '',
            name: '',
            price: 0,
            product_category_id: first.id,
            product_category: { ...first },
            created_at: now,
            updated_at: now,
        };
        loadState.value = 'ready';
    } catch (e: unknown) {
        console.error('[ProductCreatePage] init failed:', e);
        loadState.value = 'error';
    }
});

async function createProduct(product: Product): Promise<void> {
    try {
        await ProductsRepository.upsertOne(product);
        showToast({
            message: t('pages.productForm.saveSuccess'),
            variant: 'success',
        });
        navigateBack();
    } catch (e: unknown) {
        console.error('[ProductCreatePage] create product failed:', e);
        showToast({
            message: t('pages.productForm.saveError'),
            variant: 'error',
        });
    }
}
</script>
