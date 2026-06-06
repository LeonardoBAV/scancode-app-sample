// --- Imports ---
import { ref, readonly, type DeepReadonly, type Ref } from 'vue';
import { EventsRepository } from '../../db/repositories/events.repo';
import type { Event } from '../../types/schema/event';


class CurrentEventComposable {
    private readonly event: Ref<Event | null> = ref<Event | null>(null);
    private readonly isLoading: Ref<boolean> = ref<boolean>(false);

    public getEvent(): DeepReadonly<Ref<Event | null>> {
        return readonly(this.event);
    }

    public getIsLoading(): DeepReadonly<Ref<boolean>> {
        return readonly(this.isLoading);
    }

    public async setEvent(eventId: number): Promise<void> {
        this.isLoading.value = true;
        try {
            this.event.value = await EventsRepository.findByIdWithRelations(eventId);
        } catch (error: unknown) {
            console.error('[CurrentEventComposable] setEvent failed:', error);
            this.event.value = null;
        } finally {
            this.isLoading.value = false;
        }
    }
}

export const useCurrentEvent: CurrentEventComposable = new CurrentEventComposable();
