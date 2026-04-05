import type { ProductCategory } from './product-category';

export interface Product {
    id: number;
    remote_id: number;
    sku: string;
    barcode: string;
    name: string;
    price: number;
    product_category_id: number;
    product_category: ProductCategory;
    created_at: string;
    updated_at: string;
}
