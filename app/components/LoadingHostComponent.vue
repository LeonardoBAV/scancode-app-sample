<template>
    <GridLayout
        v-if="loadingVisible"
        rows="*"
        columns="*"
        class="bg-background opacity-80"
        horizontalAlignment="stretch"
        verticalAlignment="stretch"
        isUserInteractionEnabled="true"
    >
        <StackLayout verticalAlignment="center" horizontalAlignment="center" class="p-8">
            <Label :text="Icons.lucide('loader-2')" class="lucide text-4xl text-foreground lucide-spin mb-3" horizontalAlignment="center" />
            <Label
                :text="displayMessage"
                class="text-base text-muted-foreground text-center"
                textWrap="true"
                horizontalAlignment="center"
            />
        </StackLayout>
    </GridLayout>
</template>

<script setup lang="ts">
// --- Imports ---
import { computed, type ComputedRef } from 'vue';
import { loadingMessage, loadingVisible } from '../composables/loading-state';
import { i18n } from '../configs/i18n';
import { Icons } from '../utils/icons';


const displayMessage: ComputedRef<string> = computed((): string => {
    return loadingMessage.value ?? String(i18n.global.t('common.loading'));
});
</script>
