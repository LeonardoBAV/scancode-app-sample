import type { Client } from './client';
import type { OrderItem } from './order-item';

/** API / SQLite `orders.status` (CHECK). */
export type OrderStatus = 'pending' | 'completed' | 'cancelled';

export interface Order {
    id: number | null;
    remote_id: number | null;
    event_id: number;
    status: OrderStatus;
    notes: string | null;
    buyer_name: string | null;
    buyer_phone: string | null;
    client_id: number;
    sales_representative_id: number;
    payment_method_id: number | null;
    is_sync: boolean;
    created_at: string;
    updated_at: string;
    order_items?: OrderItem[];
    client?: Client | null;
}
