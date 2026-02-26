<template>
    <Page actionBarHidden="true">
        <StackLayout>
            <GridLayout rows="auto" columns="auto, *" class="header">
                <Label row="0" col="1" text="Escolher cliente" class="header-title" />
            </GridLayout>
            <ClientListComponent @confirm="onClientConfirmed" />
        </StackLayout>
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

<style scoped>
.header {
    background-color: #1e293b;
    color: white;
    padding: 16;
}

.header-title {
    font-size: 18;
    font-weight: bold;
    vertical-align: center;
}
</style>
