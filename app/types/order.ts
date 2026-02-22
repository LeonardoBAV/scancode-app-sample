/**
 * Order status.
 */
export type OrderStatus = 'Open' | 'Closed' | 'Canceled'; //obs: tavles isto é um ENUM

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
