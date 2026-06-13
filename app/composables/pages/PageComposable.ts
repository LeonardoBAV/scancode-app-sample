// --- Imports ---
import { readonly, ref, type DeepReadonly, type Ref } from 'vue';
import { loadingState } from '../loading-state';


export abstract class PageComposable {
    protected readonly isProcessing: Ref<boolean> = ref<boolean>(false);

    public getIsProcessing(): DeepReadonly<Ref<boolean>> {
        return readonly(this.isProcessing);
    }

    public async runProcessing<T>(callback: () => Promise<T>, message?: string): Promise<T> {
        this.isProcessing.value = true;
        loadingState.show(message);

        try {
            return await callback();
        } finally {
            this.isProcessing.value = false;
            loadingState.hide();
        }
    }
}
