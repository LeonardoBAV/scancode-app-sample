<template>
    <GridLayout rows="auto, *" class="bg-background">
        <!-- Search -->
        <StackLayout row="0" class="px-4 pt-2 pb-2">
            <GridLayout columns="auto, *" class="input-search">
                <Label col="0" :text="lucide('search')" class="lucide text-muted-foreground mr-3" verticalAlignment="center" />
                <TextField col="1" v-model="searchQuery" :hint="$t('pages.clientList.searchHint')" class="text-base text-foreground p-0" placeholderColor="#a1a1aa" />
            </GridLayout>
        </StackLayout>

        <!-- List -->
        <ListView v-if="filteredClients.length > 0" row="1" :items="filteredClients" separatorColor="transparent">
            <template #default="{ item }">
                <GridLayout
                    rows="auto, auto, auto"
                    columns="auto, *"
                    :class="['p-4 mx-4 mb-2 border rounded-lg', selectedClientId === item.id ? 'bg-primary border-primary' : 'bg-card border-border']"
                    @tap="$emit('select', item)"
                >
                    <Label row="0" col="0" rowSpan="3" :text="lucide('users')" :class="['lucide mr-4', selectedClientId === item.id ? 'text-primary-foreground' : 'text-muted-foreground']" verticalAlignment="top" />
                    <Label row="0" col="1" :text="item.fantasy_name" :class="['text-base font-semibold', selectedClientId === item.id ? 'text-primary-foreground' : 'text-card-foreground']" textWrap="true" verticalAlignment="top" />
                    <Label row="1" col="1" :text="formatCPFCNPJ(item.cpf_cnpj)" :class="['text-sm mt-1', selectedClientId === item.id ? 'text-primary-foreground opacity-70' : 'text-muted-foreground']" />
                    <Label row="2" col="1" :text="item.phone" :class="['text-xs mt-1', selectedClientId === item.id ? 'text-primary-foreground opacity-70' : 'text-muted-foreground']" />
                </GridLayout>
            </template>
        </ListView>

        <!-- Empty state -->
        <StackLayout v-else row="1" class="p-8" verticalAlignment="center" horizontalAlignment="center">
            <Label :text="lucide('users')" class="lucide text-muted-foreground text-4xl text-center mb-4" />
            <Label :text="$t('pages.clientList.empty')" class="text-lg font-semibold text-foreground text-center mb-2" />
            <Label :text="$t('pages.clientList.emptyHint')" class="text-sm text-muted-foreground text-center" textWrap="true" />
        </StackLayout>
    </GridLayout>
</template>

<script setup lang="ts">
// --- Imports ---
import { ref, computed } from 'vue';
import type { Client } from '../types/client';
import { formatCPFCNPJ } from '../utils/format';
import { lucide } from '../utils/icons';


// --- Component logic ---
const props = defineProps<{
    clients: Client[];
    selectedClientId: number | null;
}>();

defineEmits<{
    (e: 'select', client: Client): void;
}>();

const searchQuery = ref('');

const filteredClients = computed(() => {
    const term = searchQuery.value.trim().toLowerCase();
    if (!term) return props.clients;
    return props.clients.filter(
        (c: Client) => c.fantasy_name.toLowerCase().includes(term) || c.cpf_cnpj.includes(term),
    );
});
</script>
