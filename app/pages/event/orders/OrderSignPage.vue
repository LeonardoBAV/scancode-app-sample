<template>
    <Page actionBarHidden="true" @navigatedTo="onNavigatedTo" @navigatingFrom="onNavigatingFrom">
        <GridLayout rows="auto, *, auto" columns="*" class="sign-page">
            <GridLayout row="1" col="0" class="pad-wrap m-4">
                <DrawingPad ref="drawingPad" height="100%" width="100%" penColor="#0f172a" penWidth="3" class="drawing-pad" />
            </GridLayout>
            <GridLayout row="2" col="0" rows="auto" columns="*, *" class="footer-actions">
                <Button row="0" col="0" text="Limpar" class="btn-clear" @tap="onClear" />
                <Button row="0" col="1" text="Confirmar" class="btn-confirm" @tap="onConfirm" />
            </GridLayout>
        </GridLayout>
    </Page>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue';
import { Application, isAndroid } from '@nativescript/core';
import OrderListPage from './OrderListPage.vue';

const drawingPad = ref<any>(null);

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

<style scoped>
.sign-page {
    background-color: #f1f5f9;
}

.header-title {
    font-size: 18;
    font-weight: bold;
    color: white;
    background-color: #1e293b;
    padding: 16;
    text-align: center;
}

.pad-wrap {
    background-color: white;
    border-radius: 12;
    border-width: 2;
    border-color: #cbd5e1;
}

.drawing-pad {
    background-color: white;
    border-radius: 10;
}

.footer-actions {
    padding: 16;
    column-spacing: 16;
}

.btn-clear {
    background-color: #64748b;
    color: white;
    border-radius: 10;
    padding: 14;
    font-size: 16;
    margin-right: 8;
}

.btn-confirm {
    background-color: #22c55e;
    color: white;
    border-radius: 10;
    padding: 14;
    font-size: 16;
    font-weight: 600;
    margin-left: 8;
}
</style>
