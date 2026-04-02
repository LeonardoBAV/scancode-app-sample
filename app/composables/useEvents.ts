// --- Imports ---
import * as eventsRepo from '../db/repositories/events.repo';
import { ref, readonly, type Ref } from 'vue';
import { initDatabase } from '../db/database';
import type { Event } from '../types/schema/event';


// --- Singleton state (shared by every caller of useEvents) ---
const events: Ref<Event[]> = ref([]);
const isLoading: Ref<boolean> = ref(false);

async function loadEvents(): Promise<void> {
    isLoading.value = true;
    try {
        await initDatabase();
        const rows: Event[] = await eventsRepo.findAll();
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
