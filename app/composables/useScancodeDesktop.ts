// --- Imports ---
import { computed, readonly, ref, type ComputedRef, type DeepReadonly, type Ref } from 'vue';
import { useCurrentEvent } from './repository/useCurrentEvent';


export class ScancodeDesktopComposable {
    private static readonly _instance: ScancodeDesktopComposable = new ScancodeDesktopComposable();

    private readonly url: Ref<string | null> = ref<string | null>(null);
    private readonly hasToUseScancodeDesktop: ComputedRef<boolean> = computed(() => {
        const hasStockLimit: boolean = useCurrentEvent.getEvent().value?.has_stock_limit ?? false;
        const hasUrl: boolean = Boolean(this.url.value?.trim());

        return hasStockLimit && !hasUrl;
    });

    private constructor() { }

    public static getInstance(): ScancodeDesktopComposable {
        return ScancodeDesktopComposable._instance;
    }

    public getUrl(): DeepReadonly<Ref<string | null>> {
        return readonly(this.url);
    }

    public getHasToUseScancodeDesktop(): ComputedRef<boolean> {
        return this.hasToUseScancodeDesktop;
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
