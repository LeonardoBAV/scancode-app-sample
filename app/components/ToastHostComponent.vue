<template>
    <!-- Trilho: GridLayout auto+* (StackLayout filho esticava e ignorava width no Android). -->
    <GridLayout
        v-if="toastVisible"
        rows="auto"
        columns="*"
        horizontalAlignment="stretch"
        verticalAlignment="bottom"
        class="m-0 p-0"
        isUserInteractionEnabled="false"
    >
        <StackLayout
            row="0"
            col="0"
            :key="toastAnimKey"
            class="bg-card border-t border-border p-0 rounded-t-lg"
            horizontalAlignment="stretch"
        >
            <GridLayout
                columns="auto, *"
                class="bg-border"
                horizontalAlignment="stretch"
                style="height: 3"
                @layoutChanged="onTrackLayoutOrLoaded"
                @loaded="onTrackLayoutOrLoaded"
            >
                <StackLayout
                    ref="fillRef"
                    row="0"
                    col="0"
                    class="bg-primary"
                    horizontalAlignment="left"
                    verticalAlignment="stretch"
                    style="height: 3"
                />
                <StackLayout row="0" col="1" style="height: 3" />
            </GridLayout>
            <GridLayout columns="auto, *" class="px-4 py-3">
                <Label
                    col="0"
                    :text="iconChar"
                    class="lucide text-xl mr-3 text-primary"
                    verticalAlignment="top"
                />
                <Label
                    col="1"
                    :text="toastMessage"
                    class="text-sm text-card-foreground"
                    textWrap="true"
                    verticalAlignment="center"
                />
            </GridLayout>
        </StackLayout>
    </GridLayout>
</template>

<script setup lang="ts">
// --- Imports ---
import { computed, onUnmounted, ref, watch, type ComputedRef, type Ref } from 'vue';
import type { EventData } from '@nativescript/core';
import { Utils, View } from '@nativescript/core';
import {
    hideToast,
    toastAnimKey,
    toastDurationMs,
    toastMessage,
    toastVariant,
    toastVisible,
} from '../composables/toast-state';
import { Icons } from '../utils/icons';


// --- Component logic ---
const fillRef: Ref<{ nativeView?: View } | null> = ref(null);

const iconChar: ComputedRef<string> = computed(() =>
    toastVariant.value === 'success' ? Icons.lucide('circle-check') : Icons.lucide('circle-x'),
);

const trackWidthDip: Ref<number> = ref(0);

/** Single rAF loop: drive fill from elapsed time; hide only when elapsed >= duration. */
let progressRafId: number | null = null;

function clearProgressLoop(): void {
    if (progressRafId !== null) {
        globalThis.cancelAnimationFrame(progressRafId);
        progressRafId = null;
    }
}

function setFillWidthDip(widthDip: number): void {
    Utils.executeOnUIThread((): void => {
        const nv: View | undefined = fillRef.value?.nativeView;
        if (!nv) {
            return;
        }
        const clamped: number = Math.max(0, Math.round(widthDip));
        nv.width = clamped;
    });
}

function startProgressLoop(): void {
    clearProgressLoop();
    if (trackWidthDip.value <= 0) {
        return;
    }
    setFillWidthDip(0);
    const durationMs: number = toastDurationMs.value;
    const startMs: number = Date.now();

    function onProgressFrame(): void {
        if (!toastVisible.value) {
            clearProgressLoop();
            return;
        }
        const totalDip: number = trackWidthDip.value;
        if (totalDip <= 0) {
            progressRafId = globalThis.requestAnimationFrame(onProgressFrame);
            return;
        }
        const elapsed: number = Date.now() - startMs;
        const ratio: number = Math.min(1, elapsed / durationMs);
        setFillWidthDip(ratio * totalDip);
        if (elapsed >= durationMs) {
            progressRafId = null;
            Utils.executeOnUIThread((): void => {
                const nv: View | undefined = fillRef.value?.nativeView;
                if (nv) {
                    nv.width = Math.max(0, Math.round(trackWidthDip.value));
                }
                hideToast();
            });
            return;
        }
        progressRafId = globalThis.requestAnimationFrame(onProgressFrame);
    }

    progressRafId = globalThis.requestAnimationFrame(onProgressFrame);
}

function readTrackWidthDip(trackView: View): number {
    const measured: number = trackView.getMeasuredWidth();
    if (measured > 0) {
        return measured;
    }
    const ew: unknown = (trackView as unknown as { effectiveWidth?: number }).effectiveWidth;
    if (typeof ew === 'number' && ew > 0) {
        return ew;
    }
    return 0;
}

function applyTrackMeasureAndStart(trackView: View): void {
    if (!toastVisible.value) {
        return;
    }
    const w: number = readTrackWidthDip(trackView);
    if (w <= 0) {
        return;
    }
    trackWidthDip.value = w;
    if (progressRafId === null) {
        startProgressLoop();
    }
}

function scheduleMeasureTrack(trackView: View): void {
    globalThis.requestAnimationFrame((): void => {
        applyTrackMeasureAndStart(trackView);
        if (toastVisible.value && trackWidthDip.value <= 0) {
            globalThis.setTimeout((): void => {
                applyTrackMeasureAndStart(trackView);
            }, 64);
        }
    });
}

function onTrackLayoutOrLoaded(args: EventData): void {
    const sender: unknown = args.object;
    if (!(sender instanceof View)) {
        return;
    }
    scheduleMeasureTrack(sender);
}

watch(
    () => [toastVisible.value, toastAnimKey.value] as const,
    (): void => {
        clearProgressLoop();
        trackWidthDip.value = 0;
        setFillWidthDip(0);
    },
    { flush: 'post' },
);

onUnmounted((): void => {
    clearProgressLoop();
});
</script>
