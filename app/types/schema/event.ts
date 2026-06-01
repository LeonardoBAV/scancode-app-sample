import type { Order } from './order';

export interface Event {
    id: number;
    remote_id: number;
    is_sync: boolean;
    name: string;
    start: string;
    end: string;
    has_stock_limit: boolean;
    created_at: string;
    updated_at: string;
    orders?: Order[];
}
