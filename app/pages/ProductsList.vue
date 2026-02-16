<template>
    <Page actionBarHidden="true">
        <StackLayout class="p-4">
            <Label text="Produtos" class="text-xl font-bold text-gray-900 mb-2" />
            <Label text="Em breve..." class="text-sm text-gray-500" />
        </StackLayout>
    </Page>
</template>

<script setup lang="ts">
import type { Evento } from '../types/evento'

defineProps<{ event: Evento }>()
</script>
