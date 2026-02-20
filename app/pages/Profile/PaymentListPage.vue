<template>
    <Page>
        <ActionBar title="Payment list">
            <NavigationButton text="Back" android.systemIcon="ic_menu_back" @tap="goBack" />
        </ActionBar>
        <StackLayout class="p-4">
            <Label text="Payment list (placeholder)" class="text-gray-600" />
        </StackLayout>
    </Page>
</template>

<script setup lang="ts">
import { getCurrentInstance } from 'vue';

const instance = getCurrentInstance();
const globals = instance?.appContext.config.globalProperties;
const navigateBack = globals?.$navigateBack as () => Promise<void> | void;

function goBack(): void {
    return navigateBack?.();
}
</script>
