/**
 * View model for event list / tab layout (aggregates + display strings).
 * Not the SQLite row — see {@link Event} in types/schema/event.
 */
export interface EventItem {
    id: number;
    name: string;
    status: string;
    totalValue: number;
    startDate: string;
    endDate: string;
    orderCount: number;
    ordersSynced: number;
    ordersUnsynced: number;
}
