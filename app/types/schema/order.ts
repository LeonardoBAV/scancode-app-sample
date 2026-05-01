import type { Client } from './client';
import type { OrderItem } from './order-item';

export interface Order {
    id: number | null;
    remote_id: number | null;
    event_id: number;
    status: string;
    notes: string | null;
    client_id: number;
    sales_representative_id: number;
    payment_method_id: number | null;
    is_sync: boolean;
    created_at: string;
    updated_at: string;
    order_items?: OrderItem[];
    client?: Client | null;
}
