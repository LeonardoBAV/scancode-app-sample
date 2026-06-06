// --- Imports ---
import { useCurrentEvent } from '../repository/useCurrentEvent';
import { useSelectedOrder } from './SelectedOrderComposable';


class RefreshOrderEventComposable {
    public async run(): Promise<void> {
        const orderId: number | null = useSelectedOrder.getOrder().value?.id ?? null;
        const eventId: number | null = useCurrentEvent.getEvent().value?.id ?? null;

        await useSelectedOrder.setOrder(orderId);
        await useCurrentEvent.setEvent(eventId);
    }
}

export const useRefreshOrderEvent: RefreshOrderEventComposable = new RefreshOrderEventComposable();
