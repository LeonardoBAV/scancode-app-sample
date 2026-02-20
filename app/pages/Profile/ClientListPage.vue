<template>
    <Page>
        <ActionBar title="Client list">
            <NavigationButton text="Back" android.systemIcon="ic_menu_back" @tap="goBack" />
        </ActionBar>
        <ListView :items="clients" separatorColor="transparent" class="list">
            <template #default="{ item }">
                <GridLayout rows="auto, auto" columns="*" class="client-item p-3 m-2 rounded-lg border border-gray-200">
                    <Label row="0" col="0" :text="item.fantasy_name" class="text-base font-bold text-gray-900" textWrap="true" />
                    <Label row="1" col="0" :text="item.cpf_cnpj" class="text-sm text-gray-600 mt-1" textWrap="true" />
                </GridLayout>
            </template>
        </ListView>
    </Page>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue';
import type { Client } from '../../types/client';

const clients = ref<Client[]>([
    { id: 1, cpf_cnpj: '12.345.678/0001-90', corporate_name: 'Alpha Comércio Ltda', fantasy_name: 'Alpha Store', email: 'contato@alpha.com', phone: '(11) 99999-0001', carrier: 'Vivo' },
    { id: 2, cpf_cnpj: '98.765.432/0001-10', corporate_name: 'Beta Serviços S.A.', fantasy_name: 'Beta Solutions', email: 'contato@beta.com', phone: '(21) 98888-0002', carrier: 'Claro' },
    { id: 3, cpf_cnpj: '11.222.333/0001-44', corporate_name: 'Gamma Indústria ME', fantasy_name: 'Gamma Factory', email: 'contato@gamma.com', phone: '(31) 97777-0003', carrier: 'Tim' },
    { id: 4, cpf_cnpj: '55.666.777/0001-88', corporate_name: 'Delta Distribuidora Ltda', fantasy_name: 'Delta Dist', email: 'contato@delta.com', phone: '(41) 96666-0004', carrier: 'Oi' },
]);

const instance = getCurrentInstance();
const globals = instance?.appContext.config.globalProperties;
const navigateBack = globals?.$navigateBack as () => Promise<void> | void;

function goBack(): void {
    return navigateBack?.();
}
</script>

<style scoped>
.client-item {
    background-color: #fafafa;
}
</style>
