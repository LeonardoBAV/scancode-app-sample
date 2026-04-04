// --- Imports ---
import { ref, readonly, type Ref } from 'vue';
import { EventsRepository } from '../db/repositories/events.repo';
import type { Event } from '../types/schema/event';


const events: Ref<Event[]> = ref([]);
const isLoading: Ref<boolean> = ref(false);

export async function loadEvents(): Promise<void> {
    isLoading.value = true;
    try {
        const rows: Event[] = await EventsRepository.findAll();
        console.log('[useEvents] rows from SQLite:', rows.length);
        events.value = rows;
    } catch (error) {
        console.error('[useEvents] loadEvents failed:', error);
    } finally {
        isLoading.value = false;
    }
}

export function useEvents() {
    return {
        events: readonly(events),
        isLoading: readonly(isLoading),
        loadEvents,
    };
}
