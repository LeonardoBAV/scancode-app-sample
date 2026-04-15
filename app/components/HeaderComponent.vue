<template>
    <GridLayout columns="auto, *, auto" class="px-4 py-3 border-b border-border bg-card">

        <!-- Left: Back button or spacer -->
        <Label v-if="canGoBack" col="0" :text="Icons.lucide('arrow-left')" class="lucide text-foreground w-10 h-10 text-center" verticalAlignment="center" @tap="goBack" />
        <Label v-else col="0" text="" class="w-10" />

        <!-- Center: Title -->
        <Label col="1" :text="title" class="text-lg font-bold text-foreground text-center" verticalAlignment="center" />

        <!-- Right: optional action icon, else avatar, else spacer -->
        <Label
            v-if="rightActionIcon"
            col="2"
            :text="Icons.lucide(rightActionIcon)"
            class="lucide text-primary w-10 h-10 text-center"
            verticalAlignment="center"
            @tap="onRightAction"
        />
        <Label
            v-else-if="showAvatar && avatarInitials"
            col="2"
            :text="avatarInitials"
            class="text-sm font-bold text-primary-foreground bg-primary w-10 h-10 rounded-full text-center"
            verticalAlignment="center"
            @tap="openProfile"
        />
        <Label v-else col="2" text="" class="w-10" />

    </GridLayout>
</template>

<script setup lang="ts">
// --- Imports ---
import { nextTick, onMounted, ref, type Ref } from 'vue';
import { Frame } from '@nativescript/core';
import { useNavigation } from '../composables/useNavigation';
import { getAuth } from '../persistence/auth-session';
import { Icons, type LucideIcon } from '../utils/icons';
import Profile from '../pages/Profile/Profile.vue';


// --- Component logic ---
const props = withDefaults(
    defineProps<{
        title: string;
        showAvatar?: boolean;
        rightActionIcon?: LucideIcon | null;
    }>(),
    {
        showAvatar: true,
        rightActionIcon: null,
    },
);

const emit = defineEmits<{
    rightAction: [];
}>();

const { navigateTo } = useNavigation();

const canGoBack: Ref<boolean> = ref(false);

const avatarInitials: string = ((): string => {
    if (!props.showAvatar) {
        return '';
    }
    const auth = getAuth();
    const name: string = auth?.sales_representative?.name ?? '';
    const parts: string[] = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
})();

function getNavFrame(): Frame | null {
    const topmost: Frame | null = Frame.topmost();
    if (topmost?.canGoBack()) {
        return topmost;
    }
    return Frame.getFrameById('root-frame') ?? topmost;
}

onMounted(() => {
    function updateCanGoBack(): void {
        const frame: Frame | null = getNavFrame();
        canGoBack.value = frame?.canGoBack() ?? false;
    }
    updateCanGoBack();
    void nextTick(() => {
        updateCanGoBack();
    });
    setTimeout(updateCanGoBack, 50);
});

function goBack(): void {
    const frame: Frame | null = getNavFrame();
    if (frame?.canGoBack()) {
        frame.goBack();
    }
}

function onRightAction(): void {
    emit('rightAction');
}

function openProfile(): void {
    navigateTo(Profile, {
        frame: 'root-frame',
        transition: { name: 'slideLeft', duration: 300 },
    });
}
</script>
