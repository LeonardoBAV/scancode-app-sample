<template>
    <GridLayout columns="auto, *, auto" class="px-4 py-3 border-b border-border bg-card">

        <!-- Left: Back button or spacer -->
        <Label v-if="canGoBack" col="0" :text="lucide('arrow-left')" class="lucide text-foreground w-10 h-10 text-center" verticalAlignment="center" @tap="goBack" />
        <Label v-else col="0" text="" class="w-10" />

        <!-- Center: Title -->
        <Label col="1" :text="title" class="text-lg font-bold text-foreground text-center" verticalAlignment="center" />

        <!-- Right: Avatar or custom slot area -->
        <Label v-if="showAvatar && avatarInitials" col="2" :text="avatarInitials" class="text-sm font-bold text-primary-foreground bg-primary w-10 h-10 rounded-full text-center" verticalAlignment="center" @tap="openProfile" />
        <Label v-else col="2" text="" class="w-10" />

    </GridLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance, nextTick } from 'vue';
import { Frame } from '@nativescript/core';
import { getAuth } from '../persistence/auth-session';
import { lucide } from '../utils/icons';
import Profile from '../pages/Profile/Profile.vue';

const props = withDefaults(defineProps<{
    title: string;
    showAvatar?: boolean;
}>(), {
    showAvatar: true,
});

const instance = getCurrentInstance();
const navigateTo = instance?.appContext.config.globalProperties.$navigateTo as (
    target: unknown,
    options?: Record<string, unknown>
) => void;

const canGoBack = ref(false);

const avatarInitials = (() => {
    if (!props.showAvatar) return '';
    const auth = getAuth();
    const name = auth?.sales_representative?.name ?? '';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
})();

function getNavFrame(): Frame | null {
    const topmost = Frame.topmost();
    if (topmost?.canGoBack()) return topmost;
    return Frame.getFrameById('root-frame') ?? topmost;
}

onMounted(() => {
    function updateCanGoBack(): void {
        const frame = getNavFrame();
        canGoBack.value = frame?.canGoBack() ?? false;
    }
    updateCanGoBack();
    nextTick(() => updateCanGoBack());
    setTimeout(updateCanGoBack, 50);
});

function goBack(): void {
    const frame = getNavFrame();
    if (frame?.canGoBack()) {
        frame.goBack();
    }
}

function openProfile(): void {
    navigateTo?.(Profile, {
        frame: 'root-frame',
        transition: { name: 'slideLeft', duration: 300 },
    });
}
</script>
