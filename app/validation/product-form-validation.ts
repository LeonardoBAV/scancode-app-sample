import { z } from 'zod';


class ProductFormValidation {

    private static readonly _instance: ProductFormValidation = new ProductFormValidation();

    private readonly trimmed = z.string().transform((s: string) => s.trim());

    private constructor() { }

    public static getInstance(): ProductFormValidation {
        return ProductFormValidation._instance;
    }

    private static parsePriceToNumber(trimmed: string): number {
        const normalized: string = trimmed.replace(',', '.');
        return Number.parseFloat(normalized);
    }

    public readonly productFormFieldsSchema = z.object({
        barcode: this.trimmed.pipe(z.string().min(1).max(255)),
        name: this.trimmed.pipe(z.string().min(1).max(255)),
        price: z
            .string()
            .transform((s: string) => s.trim())
            .superRefine((trimmed: string, ctx: z.core.$RefinementCtx): void => {
                if (trimmed === '') {
                    ctx.addIssue({ code: 'too_small', minimum: 1, inclusive: true, origin: 'string' });
                    return;
                }
                const n: number = ProductFormValidation.parsePriceToNumber(trimmed);
                if (!Number.isFinite(n)) {
                    ctx.addIssue({ code: 'custom' });
                    return;
                }
                if (n < 0) {
                    ctx.addIssue({ code: 'too_small', minimum: 0, inclusive: true, origin: 'number' });
                }
            })
            .transform((trimmed: string): number => ProductFormValidation.parsePriceToNumber(trimmed)),
        product_category_id: z.number().int(),
        sku: this.trimmed.pipe(z.string().min(1).max(255)),
    });

}

export const productFormValidation: ProductFormValidation = ProductFormValidation.getInstance();

export type ProductFormFields = z.infer<typeof productFormValidation.productFormFieldsSchema>;
export type ProductFormFieldKey = keyof ProductFormFields;
