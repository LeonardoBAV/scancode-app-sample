<template>
    <Page actionBarHidden="true">
        <GridLayout rows="auto, *" class="bg-background">
            <HeaderComponent row="0" :title="product?.name ?? $t('pages.productShow.title')" :showAvatar="false" />

            <ScrollView row="1">
                <StackLayout class="p-4 pb-8">
                    <StackLayout class="card p-0" androidElevation="2">
                        <StackLayout class="p-4">
                            <Label :text="$t('pages.productShow.name')" class="text-xs text-muted-foreground mb-1" />
                            <Label :text="product?.name ?? '—'" class="text-base font-semibold text-card-foreground" textWrap="true" />
                        </StackLayout>
                        <StackLayout class="bg-border mx-4" style="height: 1" />
                        <StackLayout class="p-4">
                            <Label :text="$t('pages.productShow.sku')" class="text-xs text-muted-foreground mb-1" />
                            <Label :text="product?.sku ?? '—'" class="text-base font-semibold text-card-foreground" textWrap="true" />
                        </StackLayout>
                        <StackLayout class="bg-border mx-4" style="height: 1" />
                        <StackLayout class="p-4">
                            <Label :text="$t('pages.productShow.barcode')" class="text-xs text-muted-foreground mb-1" />
                            <Label :text="product?.barcode ?? '—'" class="text-base font-semibold text-card-foreground" textWrap="true" />
                        </StackLayout>
                        <StackLayout class="bg-border mx-4" style="height: 1" />
                        <StackLayout class="p-4">
                            <Label :text="$t('pages.productShow.category')" class="text-xs text-muted-foreground mb-1" />
                            <Label :text="product?.product_category?.name ?? '—'" class="text-base font-semibold text-card-foreground" textWrap="true" />
                        </StackLayout>
                        <StackLayout class="bg-border mx-4" style="height: 1" />
                        <StackLayout class="p-4">
                            <Label :text="$t('pages.productShow.price')" class="text-xs text-muted-foreground mb-1" />
                            <Label :text="formatCurrencyBR(product?.price ?? 0)" class="text-base font-bold text-success" textWrap="true" />
                        </StackLayout>
                    </StackLayout>
                </StackLayout>
            </ScrollView>
        </GridLayout>
    </Page>
</template>

<script setup lang="ts">
// --- Imports ---
import type { Product } from '../../types/product';
import { formatCurrencyBR } from '../../utils/format';
import HeaderComponent from '../../components/HeaderComponent.vue';


// --- Component logic ---
defineProps<{
    product: Product | null;
}>();
</script>
