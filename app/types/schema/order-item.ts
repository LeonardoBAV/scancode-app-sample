import type { Product } from './product';

export interface OrderItem {
    id: number | null;
    order_id: number;
    product_id: number;
    price: number;
    qty: number;
    notes: string | null;
    product?: Product | null;
}
