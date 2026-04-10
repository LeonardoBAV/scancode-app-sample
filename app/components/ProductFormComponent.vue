<template>
    <GridLayout rows="*, auto" class="bg-background">
        <ScrollView row="0">
            <StackLayout class="p-4 pb-2">
                <StackLayout class="card p-0" androidElevation="2">
                    <StackLayout class="p-4">
                        <Label :text="$t('pages.productShow.name')" class="text-xs text-muted-foreground mb-1" />
                        <TextField v-model="name" :hint="$t('pages.productForm.nameHint')" class="input-field" placeholderColor="#a1a1aa" />
                    </StackLayout>
                    <StackLayout class="bg-border mx-4" style="height: 1" />
                    <StackLayout class="p-4">
                        <Label :text="$t('pages.productShow.sku')" class="text-xs text-muted-foreground mb-1" />
                        <TextField v-model="sku" :hint="$t('pages.productForm.skuHint')" class="input-field" placeholderColor="#a1a1aa" />
                    </StackLayout>
                    <StackLayout class="bg-border mx-4" style="height: 1" />
                    <StackLayout class="p-4">
                        <Label :text="$t('pages.productShow.barcode')" class="text-xs text-muted-foreground mb-1" />
                        <TextField v-model="barcode" :hint="$t('pages.productForm.barcodeHint')" class="input-field" keyboardType="number" placeholderColor="#a1a1aa" />
                    </StackLayout>
                    <StackLayout class="bg-border mx-4" style="height: 1" />
                    <StackLayout class="p-4">
                        <Label :text="$t('pages.productShow.price')" class="text-xs text-muted-foreground mb-1" />
                        <TextField v-model="priceInput" :hint="$t('pages.productForm.priceHint')" class="input-field" keyboardType="number" placeholderColor="#a1a1aa" />
                    </StackLayout>
                    <StackLayout class="bg-border mx-4" style="height: 1" />
                    <StackLayout class="p-4">
                        <Label :text="$t('pages.productShow.category')" class="text-xs text-muted-foreground mb-1" />
                        <ListPicker
                            v-if="categoryNames.length > 0"
                            :items="categoryNames"
                            :selectedIndex="categorySelectedIndex"
                            height="160"
                            class="mt-2"
                            @selectedIndexChange="onCategoryIndexChange"
                        />
                        <Label
                            v-else
                            :text="$t('pages.productForm.noCategories')"
                            class="text-sm text-muted-foreground mt-2"
                            textWrap="true"
                        />
                    </StackLayout>
                </StackLayout>
            </StackLayout>
        </ScrollView>

        <StackLayout row="1" class="footer-bar" androidElevation="2" iosElevation="2">
            <Button :text="$t('pages.productForm.save')" class="btn-primary w-full" horizontalAlignment="stretch" @tap="onSave" />
        </StackLayout>
    </GridLayout>
</template>

<script setup lang="ts">
// --- Imports ---
import { computed, ref, watch, type ComputedRef, type Ref } from 'vue';
import type { Product } from '../types/schema/product';
import type { ProductCategory } from '../types/schema/product-category';


// --- Component logic ---
const props = defineProps<{
    product: Product;
    categories: ProductCategory[];
}>();

const emit = defineEmits<{
    save: [product: Product];
}>();

const sku: Ref<string> = ref('');
const barcode: Ref<string> = ref('');
const name: Ref<string> = ref('');
const priceInput: Ref<string> = ref('');
const categorySelectedIndex: Ref<number> = ref(0);

const categoryNames: ComputedRef<string[]> = computed(() => props.categories.map((c: ProductCategory): string => c.name));

function applyProductToFields(p: Product): void {
    sku.value = p.sku ?? '';
    barcode.value = p.barcode ?? '';
    name.value = p.name ?? '';
    priceInput.value = Number.isFinite(p.price) ? p.price.toFixed(2) : '0.00';
    const idx: number = props.categories.findIndex((c: ProductCategory): boolean => c.id === p.product_category_id);
    categorySelectedIndex.value = idx >= 0 ? idx : 0;
}

watch(
    () => [props.product, props.categories] as const,
    () => {
        applyProductToFields(props.product);
    },
    { immediate: true, deep: true },
);

function onCategoryIndexChange(args: { object: { selectedIndex: number } }): void {
    categorySelectedIndex.value = args.object.selectedIndex;
}

function parsePriceInput(raw: string): number {
    const trimmed: string = raw.trim().replace(',', '.');
    const n: number = Number.parseFloat(trimmed);
    return Number.isFinite(n) ? n : 0;
}

function onSave(): void {
    const base: Product = props.product;
    const cat: ProductCategory | undefined = props.categories[categorySelectedIndex.value];
    if (!cat) {
        return;
    }
    const next: Product = {
        ...base,
        sku: sku.value.trim(),
        barcode: barcode.value.trim(),
        name: name.value.trim(),
        price: parsePriceInput(priceInput.value),
        product_category_id: cat.id,
        product_category: { ...cat },
        is_sync: false,
    };
    emit('save', next);
}
</script>
