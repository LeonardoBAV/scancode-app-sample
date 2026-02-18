/**
 * Order status.
 */
export type OrderStatus = 'Open' | 'Closed' | 'Canceled';

/**
 * Order entity.
 */
export interface Order {
    id: string;
    clientCompanyName: string;
    status: OrderStatus;
    itemCount: number;
    totalValue: number;
    synced: boolean;
}
