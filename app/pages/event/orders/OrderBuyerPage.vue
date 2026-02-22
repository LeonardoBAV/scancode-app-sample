<template>
    <Page>
        <ActionBar title="Comprador">
            <NavigationButton text="Back" android.systemIcon="ic_menu_back" @tap="goBack" />
        </ActionBar>
        <StackLayout class="p-4">
            <Label text="Buyer (placeholder)" class="text-gray-600" />
        </StackLayout>
    </Page>
</template>

<script setup lang="ts">
import { getCurrentInstance } from 'vue';

const instance = getCurrentInstance();
const globals = instance?.appContext.config.globalProperties;
const navigateBack = globals?.$navigateBack as () => void;

function goBack(): void {
    navigateBack?.();
}
</script>
