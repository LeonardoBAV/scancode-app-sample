<template>
    <GridLayout rows="*, auto" class="bg-background">
        <ScrollView row="0">
            <StackLayout class="p-4 pb-2">
                <StackLayout class="card p-0" androidElevation="2">
                    <StackLayout class="p-4">
                        <Label :text="$t('pages.productShow.name')" class="text-xs text-muted-foreground mb-1" />
                        <TextField v-model="name" :hint="$t('pages.productForm.nameHint')" :class="inputFieldClass('name')" placeholderColor="#a1a1aa" />
                        <Label v-if="fieldErrors.name" :text="fieldErrors.name" textWrap="true" class="text-xs text-destructive mt-1" />
                    </StackLayout>
                    <StackLayout class="bg-border mx-4" style="height: 1" />
                    <StackLayout class="p-4">
                        <Label :text="$t('pages.productShow.sku')" class="text-xs text-muted-foreground mb-1" />
                        <TextField v-model="sku" :hint="$t('pages.productForm.skuHint')" :class="inputFieldClass('sku')" placeholderColor="#a1a1aa" />
                        <Label v-if="fieldErrors.sku" :text="fieldErrors.sku" textWrap="true" class="text-xs text-destructive mt-1" />
                    </StackLayout>
                    <StackLayout class="bg-border mx-4" style="height: 1" />
                    <StackLayout class="p-4">
                        <Label :text="$t('pages.productShow.barcode')" class="text-xs text-muted-foreground mb-1" />
                        <TextField v-model="barcode" :hint="$t('pages.productForm.barcodeHint')" :class="inputFieldClass('barcode')" keyboardType="number" placeholderColor="#a1a1aa" />
                        <Label v-if="fieldErrors.barcode" :text="fieldErrors.barcode" textWrap="true" class="text-xs text-destructive mt-1" />
                    </StackLayout>
                    <StackLayout class="bg-border mx-4" style="height: 1" />
                    <StackLayout class="p-4">
                        <Label :text="$t('pages.productShow.price')" class="text-xs text-muted-foreground mb-1" />
                        <TextField v-model="priceInput" :hint="$t('pages.productForm.priceHint')" :class="inputFieldClass('price')" keyboardType="number" placeholderColor="#a1a1aa" />
                        <Label v-if="fieldErrors.price" :text="fieldErrors.price" textWrap="true" class="text-xs text-destructive mt-1" />
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
                        <Label v-if="fieldErrors.product_category_id" :text="fieldErrors.product_category_id" textWrap="true" class="text-xs text-destructive mt-2" />
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
import { useProductFormValidation } from '../composables/useProductFormValidation';
import type { ProductFormFieldKey, ProductFormFields } from '../validation/product-form-validation';
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

const fieldErrors = useProductFormValidation.fieldErrors;

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
        useProductFormValidation.clearFieldErrors();
    },
    { immediate: true, deep: true },
);

function onCategoryIndexChange(args: { object: { selectedIndex: number } }): void {
    categorySelectedIndex.value = args.object.selectedIndex;
}

async function onSave(): Promise<void> {
    const base: Product = props.product;
    const cat: ProductCategory | undefined = props.categories[categorySelectedIndex.value];
    if (!cat) {
        return;
    }
    const allowedCategoryIds: number[] = props.categories.map((c: ProductCategory): number => c.id);
    const validated: ProductFormFields | null = await useProductFormValidation.validateProductForm(
        {
            barcode: barcode.value,
            name: name.value,
            price: priceInput.value,
            product_category_id: cat.id,
            sku: sku.value,
        },
        { allowedCategoryIds, ignoreProductId: props.product.id },
    );
    if (!validated) {
        return;
    }
    const category: ProductCategory | undefined = props.categories.find(
        (c: ProductCategory): boolean => c.id === validated.product_category_id,
    );
    if (category === undefined) {
        return;
    }
    const next: Product = {
        ...base,
        sku: validated.sku,
        barcode: validated.barcode,
        name: validated.name,
        price: validated.price,
        product_category_id: validated.product_category_id,
        product_category: { ...category },
        is_sync: false,
    };
    emit('save', next);
}

function inputFieldClass(field: ProductFormFieldKey): string {
    const message: string | undefined = fieldErrors.value[field];
    return message !== undefined && message !== '' ? 'input-field-invalid' : 'input-field';
}
</script>
