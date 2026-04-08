// --- Imports ---
import { ref, type Ref } from 'vue';


// --- Toast module state (global singleton for ToastHost + showToast callers) ---
export type ToastVariant = 'success' | 'error';

const DEFAULT_DURATION_MS: number = 6000;

export const toastVisible: Ref<boolean> = ref(false);
export const toastMessage: Ref<string> = ref('');
export const toastVariant: Ref<ToastVariant> = ref('success');
export const toastDurationMs: Ref<number> = ref(DEFAULT_DURATION_MS);
/** Incremented on each showToast to remount progress animation. */
export const toastAnimKey: Ref<number> = ref(0);

let hideTimer: ReturnType<typeof setTimeout> | null = null;

export function hideToast(): void {
    if (hideTimer !== null) {
        clearTimeout(hideTimer);
        hideTimer = null;
    }
    toastVisible.value = false;
}

export function showToast(options: { durationMs?: number; message: string; variant?: ToastVariant }): void {
    if (hideTimer !== null) {
        clearTimeout(hideTimer);
        hideTimer = null;
    }
    toastMessage.value = options.message;
    toastVariant.value = options.variant ?? 'success';
    toastDurationMs.value = options.durationMs ?? DEFAULT_DURATION_MS;
    toastAnimKey.value += 1;
    toastVisible.value = true;
    // O fechamento em tempo real vem do ToastHost quando a barra chega a 100% (mesmo relógio da animação).
    const fallbackMs: number = 3000;//toastDurationMs.value;// + 2000;

    hideTimer = setTimeout((): void => {
        hideTimer = null;
        if (toastVisible.value) {
            hideToast();
        }
    }, fallbackMs);
}
