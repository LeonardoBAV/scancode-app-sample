// --- Imports ---
import { computed, readonly, ref, type ComputedRef, type DeepReadonly, type Ref } from 'vue';
import { useCurrentEvent } from './repository/useCurrentEvent';


class ScancodeDesktopComposable {
    private readonly url: Ref<string | null> = ref<string | null>(null);

    public readonly isScancodeDesktopIntegrationRequired: ComputedRef<boolean> = computed(() => {
        return useCurrentEvent.getEvent().value?.has_stock_limit ?? false;
    });

    public getUrl(): DeepReadonly<Ref<string | null>> {
        return readonly(this.url);
    }

    public setUrl(url: string | null): void {
        const nextUrl: string | null = url?.trim() ?? null;
        this.url.value = nextUrl && nextUrl.length > 0 ? nextUrl : null;
    }

    public clearUrl(): void {
        this.url.value = null;
    }
}

export const useScancodeDesktop: ScancodeDesktopComposable = new ScancodeDesktopComposable();
