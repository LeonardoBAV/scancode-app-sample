<template>
    <Page actionBarHidden="true">
        <GridLayout rows="auto, *, auto" class="bg-background">
            <HeaderComponent row="0" :title="$t('pages.orderSelectClient.title')" />

            <ClientListComponent row="1" content-only @update:selected="selectedClient = $event" @confirm="onClientConfirmed" />

            <StackLayout row="2" class="footer-bar">
                <Button
                    :text="$t('pages.orderSelectClient.confirm')"
                    :class="selectedClient ? 'btn-primary' : 'btn-primary opacity-50'"
                    :isEnabled="!!selectedClient"
                    @tap="onConfirm"
                />
            </StackLayout>
        </GridLayout>
    </Page>
</template>

<script setup lang="ts">
// --- Imports ---
import {
    orderCreateSelectedClient,
    orderCreateClientFantasyName,
    orderCreateClientCpfCnpj,
} from './order-create-state';
import { ref, getCurrentInstance } from 'vue';
import type { Client } from '../../../types/client';
import type { Ref } from 'vue';
import ClientListComponent from '../../../components/ClientListComponent.vue';
import HeaderComponent from '../../../components/HeaderComponent.vue';
import OrderShowPage from './OrderShowPage.vue';


// --- Component logic ---
const props = withDefaults(
    defineProps<{
        targetPage: 'back' | 'OrderShowPage';
    }>(),
    { targetPage: 'OrderShowPage' },
);

const selectedClient: Ref<Client | null> = ref(null);

const instance = getCurrentInstance();
const globals = instance?.appContext.config.globalProperties;
const navigateTo = globals?.$navigateTo as (target: unknown, options?: Record<string, unknown>) => void;
const navigateBack = globals?.$navigateBack as () => void;

function onClientConfirmed(client: Client): void {
    orderCreateSelectedClient.value = client;
    orderCreateClientFantasyName.value = client.fantasy_name;
    orderCreateClientCpfCnpj.value = client.cpf_cnpj;

    if (props.targetPage === 'back') {
        navigateBack?.();
    } else {
        navigateTo?.(OrderShowPage);
    }
}

function onConfirm(): void {
    if (!selectedClient.value) return;
    onClientConfirmed(selectedClient.value);
}
</script>
