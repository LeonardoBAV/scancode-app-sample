// --- Imports ---
import { computed, ref, type ComputedRef, type Ref } from 'vue';


const processingCount: Ref<number> = ref(0);
const message: Ref<string | null> = ref(null);

export const loadingVisible: ComputedRef<boolean> = computed((): boolean => processingCount.value > 0);
export const loadingMessage: ComputedRef<string | null> = computed((): string | null => message.value);

export const loadingState = {
    show(text?: string): void {
        processingCount.value += 1;
        if (text != null && text !== '') {
            message.value = text;
        }
    },

    hide(): void {
        processingCount.value = Math.max(0, processingCount.value - 1);
        if (processingCount.value === 0) {
            message.value = null;
        }
    },
};
