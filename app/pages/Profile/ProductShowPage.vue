<template>
    <Page actionBarHidden="true">
        <GridLayout rows="*" columns="*" class="bg-background">
            <GridLayout row="0" col="0" rows="auto, auto, *" class="bg-background">
                <HeaderComponent row="0" :title="headerTitle" :showAvatar="false" />

                <CustomSegmentedBarComponent
                    v-model="selectedSegment"
                    row="1"
                    class="mx-4 mt-2 mb-2"
                    leftLabelKey="pages.productShow.segmentView"
                    rightLabelKey="pages.productShow.segmentEdit"
                />

                <ScrollView row="2">
                    <ProductInfoComponent v-if="selectedSegment === 0" :product="localProduct" />
                    <ProductFormComponent v-else :product="localProduct" :categories="categories" @save="onProductFormSave" />
                </ScrollView>
            </GridLayout>

            <ToastHostComponent row="0" col="0" verticalAlignment="bottom" horizontalAlignment="stretch" />
        </GridLayout>
    </Page>
</template>

<script setup lang="ts">
// --- Imports ---
import { computed, onMounted, ref, watch, type ComputedRef, type Ref } from 'vue';
import { ProductCategoriesRepository } from '../../db/repositories/product-categories.repo';
import { ProductsRepository } from '../../db/repositories/products.repo';
import { showToast } from '../../composables/toast-state';
import { useTranslation } from '../../composables/useTranslation';
import { Haptics } from '../../utils/haptics';
import type { Product } from '../../types/schema/product';
import type { ProductCategory } from '../../types/schema/product-category';
import CustomSegmentedBarComponent from '../../components/CustomSegmentedBarComponent.vue';
import ToastHostComponent from '../../components/ToastHostComponent.vue';
import ProductFormComponent from '../../components/ProductFormComponent.vue';
import ProductInfoComponent from '../../components/ProductInfoComponent.vue';
import HeaderComponent from '../../components/HeaderComponent.vue';


// --- Component logic ---
const props = defineProps<{
    product: Product;
}>();

const { t } = useTranslation();

const selectedSegment: Ref<number> = ref(0);
const localProduct: Ref<Product> = ref(props.product);
const categories: Ref<ProductCategory[]> = ref<ProductCategory[]>([]);

watch(
    () => props.product,
    (p: Product) => {
        localProduct.value = p;
    },
    { immediate: true },
);

const headerTitle: ComputedRef<string> = computed(() => {
    const name: string = localProduct.value.name.trim();
    return name.length > 0 ? name : t('pages.productShow.title');
});

onMounted(async () => {
    try {
        categories.value = await ProductCategoriesRepository.findAll();
    } catch (e: unknown) {
        console.error('[ProductShowPage] load categories failed:', e);
    }
});

async function onProductFormSave(product: Product): Promise<void> {
    try {
        await ProductsRepository.upsertOne(product);
        localProduct.value = product;
        Haptics.vibrateSuccess();
        showToast({
            message: t('pages.productForm.saveSuccess'),
            variant: 'success',
        });
        selectedSegment.value = 0;
    } catch (e: unknown) {
        console.error('[ProductShowPage] save failed:', e);
        showToast({
            message: t('pages.productForm.saveError'),
            variant: 'error',
        });
    }
}
</script>
