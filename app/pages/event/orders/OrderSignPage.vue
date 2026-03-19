<template>
    <Page actionBarHidden="true" @navigatedTo="onNavigatedTo" @navigatingFrom="onNavigatingFrom">
        <GridLayout rows="*, auto" class="bg-background">
            <GridLayout row="0" rows="*" class="p-4">
                <GridLayout row="0" class="bg-card border border-border rounded-lg">
                    <DrawingPad ref="drawingPad" height="100%" width="100%" penColor="#0f172a" penWidth="3" />
                </GridLayout>
            </GridLayout>

            <StackLayout row="1" class="footer-bar">
                <GridLayout columns="*, *" columnSpacing="12">
                    <Button col="0" :text="$t('pages.orderSign.clear')" class="btn-secondary" @tap="onClear" />
                    <Button col="1" :text="$t('pages.orderSign.confirm')" class="btn-primary" @tap="onConfirm" />
                </GridLayout>
            </StackLayout>
        </GridLayout>
    </Page>
</template>

<script setup lang="ts">
// --- Imports ---
import { ref, getCurrentInstance } from 'vue';
import { Application, isAndroid } from '@nativescript/core';
import OrderListPage from './OrderListPage.vue';


// --- Component logic ---
interface DrawingPadNative {
    clearDrawing: () => void;
    getDrawing: () => Promise<unknown>;
}

const drawingPad = ref<{ nativeView?: DrawingPadNative } | null>(null);

const instance = getCurrentInstance();
const globals = instance?.appContext.config.globalProperties;
const navigateTo = globals?.$navigateTo as (target: unknown, options?: Record<string, unknown>) => void;

function setOrientation(landscape: boolean): void {
    if (isAndroid) {
        const activity = Application.android.foregroundActivity;
        if (!activity) return;
        const orientation = landscape
            ? android.content.pm.ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE
            : android.content.pm.ActivityInfo.SCREEN_ORIENTATION_PORTRAIT;
        activity.setRequestedOrientation(orientation);
    }
}

function onNavigatedTo(): void {
    setOrientation(true);
}

function onNavigatingFrom(): void {
    setOrientation(false);
}

function onClear(): void {
    drawingPad.value?.nativeView?.clearDrawing();
}

function onConfirm(): void {
    const pad = drawingPad.value?.nativeView;
    if (pad) {
        pad.getDrawing().then(() => {
            navigateTo?.(OrderListPage, { clearHistory: true });
        });
    } else {
        navigateTo?.(OrderListPage, { clearHistory: true });
    }
}
</script>
