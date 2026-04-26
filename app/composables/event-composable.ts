import { ref, readonly, type DeepReadonly, type Ref } from 'vue';
import { EventsRepository } from '../db/repositories/events.repo';
import type { Event } from '../types/schema/event';


export class EventsComposable {
    private static events: Ref<Event[]> = ref<Event[]>([]);
    private static isLoading: Ref<boolean> = ref<boolean>(false);

    private constructor() { }

    public static getList(): DeepReadonly<Ref<Event[]>> {
        return readonly(EventsComposable.events);
    }

    public static getIsLoading(): DeepReadonly<Ref<boolean>> {
        return readonly(EventsComposable.isLoading);
    }


    public static async refresh(): Promise<void> {
        EventsComposable.isLoading.value = true;
        try {
            EventsComposable.events.value = await EventsRepository.findAll(true);
        } catch (error: unknown) {
            console.error('[EventsComposable] refresh failed:', error);
        } finally {
            EventsComposable.isLoading.value = false;
        }
    }
}
