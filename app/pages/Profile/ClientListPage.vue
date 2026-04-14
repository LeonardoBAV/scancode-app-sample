<template>
    <Page actionBarHidden="true">
        <GridLayout :rows="selectedClient ? 'auto, *, auto' : 'auto, *'" class="bg-background">
            <HeaderComponent
                row="0"
                :title="$t('pages.clientList.title')"
                :showAvatar="false"
                right-action-icon="user-plus"
                @rightAction="onNewClientTap"
            />
            <ClientListComponent row="1" :clients="clients" :selected-client-id="selectedClient?.id ?? null" @select="onSelectClient" />

            <StackLayout v-if="selectedClient" row="2" class="footer-bar">
                <Button :text="lucide('eye')" class="btn-icon lucide" @tap="onViewTap" />
            </StackLayout>
        </GridLayout>
    </Page>
</template>

<script setup lang="ts">
// --- Imports ---
import { computed, type ComputedRef, ref, type Ref } from 'vue';
import type { Client } from '../../types/schema/client';
import { ClientsComposable } from '../../composables/clients-composable';
import { lucide } from '../../utils/icons';
import { useNavigation } from '../../composables/useNavigation';
import ClientListComponent from '../../components/ClientListComponent.vue';
import ClientCreatePage from './ClientCreatePage.vue';
import ClientShowPage from './ClientShowPage.vue';
import HeaderComponent from '../../components/HeaderComponent.vue';


// --- Component logic ---
const { navigateTo } = useNavigation();

const clientsFromStore = ClientsComposable.getList();

const selectedClient: Ref<Client | null> = ref<Client | null>(null);

const clients: ComputedRef<Client[]> = computed(() =>
    clientsFromStore.value.map((client: Client): Client => ({
        ...client,
        fantasy_name: client.fantasy_name.trim() !== '' ? client.fantasy_name : client.corporate_name,
    })),
);

function onSelectClient(client: Client): void {
    selectedClient.value = selectedClient.value?.id === client.id ? null : client;
}

function onViewTap(): void {
    if (!selectedClient.value) return;
    navigateTo(ClientShowPage, {
        props: { client: selectedClient.value },
        transition: { name: 'slideLeft', duration: 300 },
    });
}

function onNewClientTap(): void {
    navigateTo(ClientCreatePage, {
        transition: { name: 'slideLeft', duration: 300 },
    });
}
</script>
