<template>
    <GridLayout rows="auto, *" class="bg-background">
        <!-- Search -->
        <StackLayout row="0" class="px-4 pt-2 pb-2">
            <GridLayout columns="auto, *" class="input-search">
                <Label col="0" :text="Icons.lucide('search')" class="lucide text-muted-foreground mr-3" verticalAlignment="center" />
                <TextField col="1" v-model="searchQuery" :hint="$t('pages.productList.searchHint')" class="text-base text-foreground p-0" placeholderColor="#a1a1aa" />
            </GridLayout>
        </StackLayout>

        <!-- List -->
        <ListView v-if="filteredProducts.length > 0" row="1" :items="filteredProducts" separatorColor="transparent">
            <template #default="{ item }">
                <GridLayout
                    rows="auto, auto"
                    columns="auto, *, auto"
                    :class="['p-4 mx-4 mb-2 border rounded-lg', selectedProductId === item.id ? 'bg-primary border-primary' : 'bg-card border-border']"
                    @tap="$emit('select', item)"
                >
                    <Label row="0" col="0" rowSpan="2" :text="Icons.lucide('package')" :class="['lucide mr-4', selectedProductId === item.id ? 'text-primary-foreground' : 'text-muted-foreground']" verticalAlignment="top" />
                    <Label
                        row="0"
                        col="1"
                        :text="item.name"
                        :class="['text-base font-semibold pr-3', selectedProductId === item.id ? 'text-primary-foreground' : 'text-card-foreground']"
                        textWrap="true"
                        verticalAlignment="center"
                    />
                    <Label
                        row="0"
                        col="2"
                        :text="Format.formatCurrencyBR(item.price)"
                        :class="['text-base font-bold text-right', selectedProductId === item.id ? 'text-primary-foreground' : 'text-success']"
                        verticalAlignment="center"
                        horizontalAlignment="right"
                    />
                    <Label
                        row="1"
                        col="1"
                        :text="item.sku + ' · ' + item.product_category.name"
                        :class="['text-xs mt-2 pr-3', selectedProductId === item.id ? 'text-primary-foreground opacity-70' : 'text-muted-foreground']"
                        textWrap="true"
                        verticalAlignment="center"
                    />
                    <Label
                        row="1"
                        col="2"
                        :text="item.is_sync ? $t('common.syncBadgeSynced') : $t('common.syncBadgePending')"
                        :class="[item.is_sync ? 'badge-success' : 'badge-secondary', 'mt-2']"
                        verticalAlignment="center"
                        horizontalAlignment="right"
                    />
                </GridLayout>
            </template>
        </ListView>

        <!-- Empty state -->
        <StackLayout v-else row="1" class="p-8" verticalAlignment="center" horizontalAlignment="center">
            <Label :text="Icons.lucide('package')" class="lucide text-muted-foreground text-4xl text-center mb-4" />
            <Label :text="$t('pages.productList.empty')" class="text-lg font-semibold text-foreground text-center mb-2" />
            <Label :text="$t('pages.productList.emptyHint')" class="text-sm text-muted-foreground text-center" textWrap="true" />
        </StackLayout>
    </GridLayout>
</template>

<script setup lang="ts">
// --- Imports ---
import { ref, computed } from 'vue';
import type { Product } from '../types/schema/product';
import { Format } from '../utils/format';
import { Icons } from '../utils/icons';


// --- Component logic ---
const props = defineProps<{
    products: Product[];
    selectedProductId: number | null;
}>();

defineEmits<{
    (e: 'select', product: Product): void;
}>();

const searchQuery = ref('');

const filteredProducts = computed(() => {
    const term = searchQuery.value.trim().toLowerCase();
    if (!term) return props.products;
    return props.products.filter(
        (p: Product) =>
            p.sku.toLowerCase().includes(term) ||
            p.name.toLowerCase().includes(term) ||
            p.product_category.name.toLowerCase().includes(term),
    );
});
</script>
