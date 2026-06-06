// --- Imports ---
import { productFormValidation, type ProductFormFieldKey, type ProductFormFields } from '../validation/product-form-validation';
import type { ProductFormSchema } from '../types/form/product-form-schema';
import { ProductsRepository } from '../db/repositories/products.repo';
import { ref, type Ref } from 'vue';
import { i18n } from '../configs/i18n';
import type { core } from 'zod';


class UseProductFormValidation {
    public readonly fieldErrors: Ref<Partial<Record<ProductFormFieldKey, string>>> =
        ref<Partial<Record<ProductFormFieldKey, string>>>({});

    public clearFieldErrors(): void {
        this.fieldErrors.value = {};
    }

    private mapIssueToMessage(issue: core.$ZodIssue): string {
        const t = i18n.global.t;
        const pathKey: unknown = issue.path[0];
        const key: string = typeof pathKey === 'string' ? pathKey : '';

        if (key === 'sku') {
            if (issue.code === 'too_small') {
                return String(t('pages.productForm.errors.skuRequired'));
            }
            if (issue.code === 'too_big') {
                return String(t('pages.productForm.errors.skuMax'));
            }
        }
        if (key === 'barcode') {
            if (issue.code === 'too_small') {
                return String(t('pages.productForm.errors.barcodeRequired'));
            }
            if (issue.code === 'too_big') {
                return String(t('pages.productForm.errors.barcodeMax'));
            }
        }
        if (key === 'name') {
            if (issue.code === 'too_small') {
                return String(t('pages.productForm.errors.nameRequired'));
            }
            if (issue.code === 'too_big') {
                return String(t('pages.productForm.errors.nameMax'));
            }
        }
        if (key === 'product_category_id') {
            return String(t('pages.productForm.errors.categoryInvalid'));
        }

        return String(t('pages.productForm.errors.generic'));
    }

    private mapPriceIssueToMessage(issue: core.$ZodIssue): string {
        const t = i18n.global.t;
        if (issue.code === 'too_small') {
            const origin: unknown = 'origin' in issue ? (issue as { origin?: unknown }).origin : undefined;
            if (origin === 'string') {
                return String(t('pages.productForm.errors.priceRequired'));
            }
            return String(t('pages.productForm.errors.priceMin'));
        }
        if (issue.code === 'custom') {
            return String(t('pages.productForm.errors.priceInvalid'));
        }
        return String(t('pages.productForm.errors.generic'));
    }

    public async validateProductForm(
        raw: ProductFormSchema,
        options: { allowedCategoryIds: number[]; ignoreProductId: number | null },
    ): Promise<ProductFormFields | null> {
        this.clearFieldErrors();
        const parsed = productFormValidation.productFormFieldsSchema.safeParse(raw);
        if (!parsed.success) {
            const nextErrors: Partial<Record<ProductFormFieldKey, string>> = {};
            for (const issue of parsed.error.issues) {
                const pathKey: unknown = issue.path[0];
                if (typeof pathKey !== 'string') {
                    continue;
                }
                const fieldKey: ProductFormFieldKey = pathKey as ProductFormFieldKey;
                if (nextErrors[fieldKey] !== undefined) {
                    continue;
                }
                const message: string =
                    fieldKey === 'price' ? this.mapPriceIssueToMessage(issue) : this.mapIssueToMessage(issue);
                nextErrors[fieldKey] = message;
            }
            this.fieldErrors.value = nextErrors;
            return null;
        }
        const data: ProductFormFields = parsed.data;
        const allowed: Set<number> = new Set<number>(options.allowedCategoryIds);
        if (!allowed.has(data.product_category_id)) {
            const t = i18n.global.t;
            this.fieldErrors.value = {
                product_category_id: String(t('pages.productForm.errors.categoryInvalid')),
            };
            return null;
        }
        const foundSku: Awaited<ReturnType<typeof ProductsRepository.loadBySku>> = await ProductsRepository.loadBySku(data.sku);
        const duplicateSku: boolean =
            foundSku != null &&
            (options.ignoreProductId == null || foundSku.id !== options.ignoreProductId);
        if (duplicateSku) {
            const t = i18n.global.t;
            this.fieldErrors.value = {
                sku: String(t('pages.productForm.errors.skuDuplicate')),
            };
            return null;
        }
        const foundBc: Awaited<ReturnType<typeof ProductsRepository.loadByBarcode>> =
            await ProductsRepository.loadByBarcode(data.barcode);
        const duplicateBc: boolean =
            foundBc != null &&
            (options.ignoreProductId == null || foundBc.id !== options.ignoreProductId);
        if (duplicateBc) {
            const t = i18n.global.t;
            this.fieldErrors.value = {
                barcode: String(t('pages.productForm.errors.barcodeDuplicate')),
            };
            return null;
        }
        return data;
    }
}


export const useProductFormValidation: UseProductFormValidation = new UseProductFormValidation();
