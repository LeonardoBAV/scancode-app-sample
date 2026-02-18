/**
 * Event entity (named EventItem to avoid conflict with DOM Event).
 */
export interface Event {
    name: string
    status: string
    totalValue: number
    startDate: string
    endDate: string
    orderCount: number
    ordersSynced: number
    ordersUnsynced: number
}
