<template>
    <Page actionBarHidden="true">
        <StackLayout>
            <GridLayout rows="auto" columns="auto, *" class="header">
                <Label row="0" col="0" text="←" class="header-back" @tap="goBack" />
                <Label row="0" col="1" text="Comprador" class="header-title" />
            </GridLayout>
            <ListView :items="clients" separatorColor="transparent" class="list p-3">
                <template #default="{ item }">
                    <GridLayout
                        rows="auto, auto"
                        columns="*"
                        class="client-item p-3 m-2 rounded-lg"
                        @tap="selectClient(item)"
                    >
                        <Label :text="item.fantasy_name" class="text-base font-semibold text-gray-900" textWrap="true" />
                        <Label :text="item.cpf_cnpj" class="text-sm text-gray-600 mt-1" textWrap="true" />
                    </GridLayout>
                </template>
            </ListView>
        </StackLayout>
    </Page>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue';
import type { Client } from '../../../types/client';
import { orderCreateClientFantasyName, orderCreateClientCpfCnpj } from './order-create-state';

const clients = ref<Client[]>([
    { id: 1, cpf_cnpj: '12.345.678/0001-90', corporate_name: 'Alpha Comércio Ltda', fantasy_name: 'Alpha Store', email: 'contato@alpha.com', phone: '(11) 99999-0001', carrier: 'Vivo' },
    { id: 2, cpf_cnpj: '98.765.432/0001-10', corporate_name: 'Beta Serviços S.A.', fantasy_name: 'Beta Solutions', email: 'contato@beta.com', phone: '(21) 98888-0002', carrier: 'Claro' },
    { id: 3, cpf_cnpj: '11.222.333/0001-44', corporate_name: 'Gamma Indústria ME', fantasy_name: 'Gamma Factory', email: 'contato@gamma.com', phone: '(31) 97777-0003', carrier: 'Tim' },
    { id: 4, cpf_cnpj: '55.666.777/0001-88', corporate_name: 'Delta Distribuidora Ltda', fantasy_name: 'Delta Dist', email: 'contato@delta.com', phone: '(41) 96666-0004', carrier: 'Oi' },
    { id: 5, cpf_cnpj: '22.333.444/0001-11', corporate_name: 'Epsilon Tech Ltda', fantasy_name: 'Epsilon Tech', email: 'contato@epsilon.com', phone: '(11) 95555-0005', carrier: 'Vivo' },
    { id: 6, cpf_cnpj: '33.444.555/0001-22', corporate_name: 'Zeta Alimentos ME', fantasy_name: 'Zeta Food', email: 'contato@zeta.com', phone: '(21) 94444-0006', carrier: 'Claro' },
    { id: 7, cpf_cnpj: '44.555.666/0001-33', corporate_name: 'Eta Logística S.A.', fantasy_name: 'Eta Log', email: 'contato@eta.com', phone: '(31) 93333-0007', carrier: 'Tim' },
    { id: 8, cpf_cnpj: '66.777.888/0001-55', corporate_name: 'Theta Comércio Ltda', fantasy_name: 'Theta Shop', email: 'contato@theta.com', phone: '(41) 92222-0008', carrier: 'Oi' },
]);

const instance = getCurrentInstance();
const globals = instance?.appContext.config.globalProperties;
const navigateBack = globals?.$navigateBack as () => void;

function goBack(): void {
    navigateBack?.();
}

function selectClient(client: Client): void {
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

.header-back {
    font-size: 24;
    padding: 8;
    vertical-align: center;
}

.header-title {
    font-size: 18;
    font-weight: bold;
    vertical-align: center;
}

.client-item {
    background-color: #f8fafc;
    border-width: 1;
    border-color: #e2e8f0;
}
</style>
