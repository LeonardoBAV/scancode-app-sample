<template>
    <Page actionBarHidden="true">
        <ClientListComponent :title="$t('pages.orderSelectClient.title')" @confirm="onClientConfirmed" />
    </Page>
</template>

<script setup lang="ts">
import { getCurrentInstance } from 'vue';
import type { Client } from '../../../types/client';
import ClientListComponent from '../../../components/ClientListComponent.vue';
import {
    orderCreateSelectedClient,
    orderCreateClientFantasyName,
    orderCreateClientCpfCnpj,
} from './order-create-state';

const instance = getCurrentInstance();
const globals = instance?.appContext.config.globalProperties;
const navigateBack = globals?.$navigateBack as () => void;

function onClientConfirmed(client: Client): void {
    orderCreateSelectedClient.value = client;
    orderCreateClientFantasyName.value = client.fantasy_name;
    orderCreateClientCpfCnpj.value = client.cpf_cnpj;
    navigateBack?.();
}
</script>
