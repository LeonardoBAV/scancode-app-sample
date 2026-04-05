import type { Product } from './schema/product';

export interface CartItem {
    product: Product;
    quantity: number;
}
