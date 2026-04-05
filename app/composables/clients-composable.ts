// --- Imports ---
import { ref, readonly, type DeepReadonly, type Ref } from 'vue';
import { ClientsRepository } from '../db/repositories/clients.repo';
import type { Client } from '../types/schema/client';


export class ClientsComposable {
    private static clients: Ref<Client[]> = ref<Client[]>([]);
    private static isLoading: Ref<boolean> = ref<boolean>(false);

    private constructor() { }

    public static getList(): DeepReadonly<Ref<Client[]>> {
        return readonly(ClientsComposable.clients);
    }

    public static getIsLoading(): DeepReadonly<Ref<boolean>> {
        return readonly(ClientsComposable.isLoading);
    }

    public static async refresh(): Promise<void> {
        ClientsComposable.isLoading.value = true;
        try {
            ClientsComposable.clients.value = await ClientsRepository.findAll();
        } catch (error: unknown) {
            console.error('[ClientsComposable] refresh failed:', error);
        } finally {
            ClientsComposable.isLoading.value = false;
        }
    }
}
