import type { ProductCategory } from './product-category';

export interface Product {
    id: number | null;
    remote_id: number | null;
    is_sync: boolean;
    sku: string;
    barcode: string;
    name: string;
    price: number;
    product_category_id: number;
    product_category: ProductCategory;
    created_at: string;
    updated_at: string;
}
