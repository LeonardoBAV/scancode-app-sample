// --- Imports ---
import { readonly, ref, type DeepReadonly, type Ref } from 'vue';


export abstract class PageComposable {
    protected readonly isProcessing: Ref<boolean> = ref<boolean>(false);

    public getIsProcessing(): DeepReadonly<Ref<boolean>> {
        return readonly(this.isProcessing);
    }
}
