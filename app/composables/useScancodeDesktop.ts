// --- Imports ---
import { computed, readonly, ref, type ComputedRef, type DeepReadonly, type Ref } from 'vue';
import { useCurrentEvent } from './repository/useCurrentEvent';


export class ScancodeDesktopComposable {
    private static readonly _instance: ScancodeDesktopComposable = new ScancodeDesktopComposable();

    private readonly url: Ref<string | null> = ref<string | null>(null);
    private readonly requiredToHandleWithStockLimit: ComputedRef<boolean> = computed(() => {
        return useCurrentEvent.getEvent().value?.has_stock_limit ?? false;
    });

    private constructor() { }

    public static getInstance(): ScancodeDesktopComposable {
        return ScancodeDesktopComposable._instance;
    }

    public getUrl(): DeepReadonly<Ref<string | null>> {
        return readonly(this.url);
    }

    public isScancodeDesktopIntegrationRequired(): ComputedRef<boolean> {
        return this.isRequiredToHandleWithStockLimit();
    }

    public isRequiredToHandleWithStockLimit(): ComputedRef<boolean> {
        return this.requiredToHandleWithStockLimit;
    }

    public setUrl(url: string | null): void {
        const nextUrl: string | null = url?.trim() ?? null;
        this.url.value = nextUrl && nextUrl.length > 0 ? nextUrl : null;
    }

    public clearUrl(): void {
        this.url.value = null;
    }
}

export const useScancodeDesktop: ScancodeDesktopComposable = ScancodeDesktopComposable.getInstance();
