import type { ProductCategory } from './product-category';

/**
 * Product entity.
 * Price is stored as number (TypeScript has no decimal type; use for currency values).
 */
export interface Product {
    id: number;
    sku: string;
    barcode: string;
    name: string;
    price: number;
    product_category_id: number;
    product_category: ProductCategory;
}
