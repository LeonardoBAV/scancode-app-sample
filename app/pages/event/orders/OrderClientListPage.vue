<template>
    <Page actionBarHidden="true">
        <GridLayout rows="*, auto" columns="*">
            <StackLayout row="0" col="0">
                <GridLayout rows="auto" columns="auto, *" class="header">
                    <Label row="0" col="1" text="Escolher cliente" class="header-title" />
                </GridLayout>
                <TextField v-model="searchQuery" hint="Search by name or CPF/CNPJ..." class="search-field p-3 m-3 rounded-lg border border-gray-300 text-base" />
                <ListView :items="filteredClients" separatorColor="transparent" class="list">
                    <template #default="{ item }">
                        <GridLayout
                            rows="auto, auto"
                            columns="*"
                            :class="['client-item', 'p-3', 'm-2', 'rounded-lg', selectedClient?.id === item.id ? 'client-item-selected' : '']"
                            @tap="onSelectItem(item)"
                        >
                            <Label row="0" col="0" :text="item.corporate_name" class="text-base font-bold text-gray-900" textWrap="true" />
                            <Label row="1" col="0" :text="item.cpf_cnpj" class="text-sm text-gray-600 mt-1" textWrap="true" />
                        </GridLayout>
                    </template>
                </ListView>
            </StackLayout>
            <StackLayout row="1" col="0" class="footer-float" verticalAlignment="bottom">
                <Button
                    text="Confirmar"
                    :isEnabled="!!selectedClient"
                    :class="selectedClient ? 'btn-confirm' : 'btn-confirm-disabled'"
                    @tap="onConfirm"
                />
            </StackLayout>
        </GridLayout>
    </Page>
</template>

<script setup lang="ts">
import { ref, computed, getCurrentInstance } from 'vue';
import type { Client } from '../../../types/client';
import {
    orderCreateSelectedClient,
    orderCreateClientFantasyName,
    orderCreateClientCpfCnpj,
} from './order-create-state';

function likeMatch(value: string, term: string): boolean {
    if (!term) return true;
    return value.toLowerCase().includes(term.toLowerCase());
}

const searchQuery = ref('');
const selectedClient = ref<Client | null>(null);

const clients = ref<Client[]>([
    { id: 1, cpf_cnpj: '12.345.678/0001-90', corporate_name: 'Alpha Comércio Ltda', fantasy_name: 'Alpha Store', email: 'contato@alpha.com', phone: '(11) 99999-0001', carrier: 'Vivo' },
    { id: 2, cpf_cnpj: '98.765.432/0001-10', corporate_name: 'Beta Serviços S.A.', fantasy_name: 'Beta Solutions', email: 'contato@beta.com', phone: '(21) 98888-0002', carrier: 'Claro' },
    { id: 3, cpf_cnpj: '11.222.333/0001-44', corporate_name: 'Gamma Indústria ME', fantasy_name: 'Gamma Factory', email: 'contato@gamma.com', phone: '(31) 97777-0003', carrier: 'Tim' },
    { id: 4, cpf_cnpj: '55.666.777/0001-88', corporate_name: 'Delta Distribuidora Ltda', fantasy_name: 'Delta Dist', email: 'contato@delta.com', phone: '(41) 96666-0004', carrier: 'Oi' },
    { id: 5, cpf_cnpj: '22.333.444/0001-11', corporate_name: 'Epsilon Tech Ltda', fantasy_name: 'Epsilon Tech', email: 'contato@epsilon.com', phone: '(11) 95555-0005', carrier: 'Vivo' },
    { id: 6, cpf_cnpj: '33.444.555/0001-22', corporate_name: 'Zeta Alimentos ME', fantasy_name: 'Zeta Food', email: 'contato@zeta.com', phone: '(21) 94444-0006', carrier: 'Claro' },
    { id: 7, cpf_cnpj: '44.555.666/0001-33', corporate_name: 'Eta Logística S.A.', fantasy_name: 'Eta Log', email: 'contato@eta.com', phone: '(31) 93333-0007', carrier: 'Tim' },
    { id: 8, cpf_cnpj: '66.777.888/0001-55', corporate_name: 'Theta Comércio Ltda', fantasy_name: 'Theta Shop', email: 'contato@theta.com', phone: '(41) 92222-0008', carrier: 'Oi' },
    { id: 9, cpf_cnpj: '77.888.999/0001-66', corporate_name: 'Iota Construção ME', fantasy_name: 'Iota Build', email: 'contato@iota.com', phone: '(51) 91111-0009', carrier: 'Vivo' },
    { id: 10, cpf_cnpj: '88.999.000/0001-77', corporate_name: 'Kappa Consultoria Ltda', fantasy_name: 'Kappa Consult', email: 'contato@kappa.com', phone: '(61) 90000-0010', carrier: 'Claro' },
    { id: 11, cpf_cnpj: '99.000.111/0001-88', corporate_name: 'Lambda Indústria S.A.', fantasy_name: 'Lambda Ind', email: 'contato@lambda.com', phone: '(71) 89999-0011', carrier: 'Tim' },
    { id: 12, cpf_cnpj: '10.111.222/0001-99', corporate_name: 'Mu Serviços ME', fantasy_name: 'Mu Services', email: 'contato@mu.com', phone: '(81) 88888-0012', carrier: 'Oi' },
    { id: 13, cpf_cnpj: '21.222.333/0001-00', corporate_name: 'Nu Distribuição Ltda', fantasy_name: 'Nu Dist', email: 'contato@nu.com', phone: '(85) 87777-0013', carrier: 'Vivo' },
    { id: 14, cpf_cnpj: '32.333.444/0001-11', corporate_name: 'Xi Comércio ME', fantasy_name: 'Xi Store', email: 'contato@xi.com', phone: '(62) 86666-0014', carrier: 'Claro' },
    { id: 15, cpf_cnpj: '43.444.555/0001-22', corporate_name: 'Omicron Tech Ltda', fantasy_name: 'Omicron Tech', email: 'contato@omicron.com', phone: '(48) 85555-0015', carrier: 'Tim' },
    { id: 16, cpf_cnpj: '54.555.666/0001-33', corporate_name: 'Pi Alimentos S.A.', fantasy_name: 'Pi Food', email: 'contato@pi.com', phone: '(27) 84444-0016', carrier: 'Oi' },
    { id: 17, cpf_cnpj: '65.666.777/0001-44', corporate_name: 'Rho Logística ME', fantasy_name: 'Rho Log', email: 'contato@rho.com', phone: '(31) 83333-0017', carrier: 'Vivo' },
    { id: 18, cpf_cnpj: '76.777.888/0001-55', corporate_name: 'Sigma Construção Ltda', fantasy_name: 'Sigma Build', email: 'contato@sigma.com', phone: '(21) 82222-0018', carrier: 'Claro' },
    { id: 19, cpf_cnpj: '87.888.999/0001-66', corporate_name: 'Tau Consultoria ME', fantasy_name: 'Tau Consult', email: 'contato@tau.com', phone: '(11) 81111-0019', carrier: 'Tim' },
    { id: 20, cpf_cnpj: '98.999.000/0001-77', corporate_name: 'Upsilon Serviços Ltda', fantasy_name: 'Upsilon Serv', email: 'contato@upsilon.com', phone: '(41) 80000-0020', carrier: 'Oi' },
]);

const filteredClients = computed(() => {
    const term = searchQuery.value.trim();
    if (!term) return clients.value;
    return clients.value.filter(
        (c: Client) => likeMatch(c.corporate_name, term) || likeMatch(c.cpf_cnpj, term)
    );
});

const instance = getCurrentInstance();
const globals = instance?.appContext.config.globalProperties;
const navigateBack = globals?.$navigateBack as () => void;

function goBack(): void {
    navigateBack?.();
}

function onSelectItem(client: Client): void {
    selectedClient.value = selectedClient.value?.id === client.id ? null : client;
}

function onConfirm(): void {
    if (!selectedClient.value) return;
    orderCreateSelectedClient.value = selectedClient.value;
    orderCreateClientFantasyName.value = selectedClient.value.fantasy_name;
    orderCreateClientCpfCnpj.value = selectedClient.value.cpf_cnpj;
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

.search-field {
    background-color: #f8fafc;
}

.client-item {
    background-color: #fafafa;
    border-width: 1;
    border-color: #e2e8f0;
}

.client-item-selected {
    background-color: #dbeafe;
    border-color: #3b82f6;
    border-width: 2;
}

.footer-float {
    padding: 16;
    background-color: white;
    border-top-width: 1;
    border-top-color: #e2e8f0;
}

.btn-confirm {
    background-color: #3b82f6;
    color: white;
    border-radius: 10;
    padding: 14;
    font-size: 16;
    font-weight: 600;
}

.btn-confirm-disabled {
    background-color: #94a3b8;
    color: white;
    border-radius: 10;
    padding: 14;
    font-size: 16;
    opacity: 0.7;
}
</style>
