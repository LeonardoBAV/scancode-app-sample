import type { Event } from '../types/schema/event';
import type { EventItem } from '../types/event-item';
import { formatIsoDateToBR } from './format';

function todayYyyyMmDd(): string {
    const n: Date = new Date();
    const y: number = n.getFullYear();
    const m: string = String(n.getMonth() + 1).padStart(2, '0');
    const d: string = String(n.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function deriveEventStatus(start: string, end: string): 'scheduled' | 'in_progress' | 'ended' {
    const today: string = todayYyyyMmDd();
    if (today < start) {
        return 'scheduled';
    }
    if (today > end) {
        return 'ended';
    }
    return 'in_progress';
}

export function eventSchemaToEventItem(row: Event): EventItem {
    return {
        id: row.id,
        name: row.name,
        status: deriveEventStatus(row.start, row.end),
        totalValue: 0,
        startDate: formatIsoDateToBR(row.start),
        endDate: formatIsoDateToBR(row.end),
        orderCount: 0,
        ordersSynced: 0,
        ordersUnsynced: 0,
    };
}
