<template>
    <Page actionBarHidden="true">
        <GridLayout rows="auto, *, auto" class="bg-background">
            <HeaderComponent row="0" :title="$t('pages.orderSelectClient.title')" />

            <ClientListComponent row="1" :clients="clients" :selected-client-id="selectedClient?.id ?? null" @select="onSelectClient" />

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
import { ref } from 'vue';
import type { Client } from '../../../types/schema/client';
import type { Ref } from 'vue';
import { useNavigation } from '../../../composables/useNavigation';
import ClientListComponent from '../../../components/ClientListComponent.vue';
import HeaderComponent from '../../../components/HeaderComponent.vue';


// --- Component logic ---
const { navigateBack } = useNavigation();

const selectedClient: Ref<Client | null> = ref(null);

function onSelectClient(client: Client): void {
    selectedClient.value = selectedClient.value?.id === client.id ? null : client;
}

const clients = ref<Client[]>([
    { id: 1, remote_id: 1, is_sync: true, cpf_cnpj: '12.345.678/0001-90', corporate_name: 'Alpha Comércio Ltda', fantasy_name: 'Alpha Store', email: 'contato@alpha.com', phone: '(11) 99999-0001', carrier: 'Vivo', created_at: '', updated_at: '' },
    { id: 2, remote_id: 2, is_sync: true, cpf_cnpj: '98.765.432/0001-10', corporate_name: 'Beta Serviços S.A.', fantasy_name: 'Beta Solutions', email: 'contato@beta.com', phone: '(21) 98888-0002', carrier: 'Claro', created_at: '', updated_at: '' },
    { id: 3, remote_id: 3, is_sync: true, cpf_cnpj: '11.222.333/0001-44', corporate_name: 'Gamma Indústria ME', fantasy_name: 'Gamma Factory', email: 'contato@gamma.com', phone: '(31) 97777-0003', carrier: 'Tim', created_at: '', updated_at: '' },
    { id: 4, remote_id: 4, is_sync: true, cpf_cnpj: '55.666.777/0001-88', corporate_name: 'Delta Distribuidora Ltda', fantasy_name: 'Delta Dist', email: 'contato@delta.com', phone: '(41) 96666-0004', carrier: 'Oi', created_at: '', updated_at: '' },
    { id: 5, remote_id: 5, is_sync: true, cpf_cnpj: '22.333.444/0001-11', corporate_name: 'Epsilon Tech Ltda', fantasy_name: 'Epsilon Tech', email: 'contato@epsilon.com', phone: '(11) 95555-0005', carrier: 'Vivo', created_at: '', updated_at: '' },
    { id: 6, remote_id: 6, is_sync: true, cpf_cnpj: '33.444.555/0001-22', corporate_name: 'Zeta Alimentos ME', fantasy_name: 'Zeta Food', email: 'contato@zeta.com', phone: '(21) 94444-0006', carrier: 'Claro', created_at: '', updated_at: '' },
    { id: 7, remote_id: 7, is_sync: true, cpf_cnpj: '44.555.666/0001-33', corporate_name: 'Eta Logística S.A.', fantasy_name: 'Eta Log', email: 'contato@eta.com', phone: '(31) 93333-0007', carrier: 'Tim', created_at: '', updated_at: '' },
    { id: 8, remote_id: 8, is_sync: true, cpf_cnpj: '66.777.888/0001-55', corporate_name: 'Theta Comércio Ltda', fantasy_name: 'Theta Shop', email: 'contato@theta.com', phone: '(41) 92222-0008', carrier: 'Oi', created_at: '', updated_at: '' },
    { id: 9, remote_id: 9, is_sync: true, cpf_cnpj: '77.888.999/0001-66', corporate_name: 'Iota Construção ME', fantasy_name: 'Iota Build', email: 'contato@iota.com', phone: '(51) 91111-0009', carrier: 'Vivo', created_at: '', updated_at: '' },
    { id: 10, remote_id: 10, is_sync: true, cpf_cnpj: '88.999.000/0001-77', corporate_name: 'Kappa Consultoria Ltda', fantasy_name: 'Kappa Consult', email: 'contato@kappa.com', phone: '(61) 90000-0010', carrier: 'Claro', created_at: '', updated_at: '' },
    { id: 11, remote_id: 11, is_sync: true, cpf_cnpj: '99.000.111/0001-88', corporate_name: 'Lambda Indústria S.A.', fantasy_name: 'Lambda Ind', email: 'contato@lambda.com', phone: '(71) 89999-0011', carrier: 'Tim', created_at: '', updated_at: '' },
    { id: 12, remote_id: 12, is_sync: true, cpf_cnpj: '10.111.222/0001-99', corporate_name: 'Mu Serviços ME', fantasy_name: 'Mu Services', email: 'contato@mu.com', phone: '(81) 88888-0012', carrier: 'Oi', created_at: '', updated_at: '' },
    { id: 13, remote_id: 13, is_sync: true, cpf_cnpj: '21.222.333/0001-00', corporate_name: 'Nu Distribuição Ltda', fantasy_name: 'Nu Dist', email: 'contato@nu.com', phone: '(85) 87777-0013', carrier: 'Vivo', created_at: '', updated_at: '' },
    { id: 14, remote_id: 14, is_sync: true, cpf_cnpj: '32.333.444/0001-11', corporate_name: 'Xi Comércio ME', fantasy_name: 'Xi Store', email: 'contato@xi.com', phone: '(62) 86666-0014', carrier: 'Claro', created_at: '', updated_at: '' },
    { id: 15, remote_id: 15, is_sync: true, cpf_cnpj: '43.444.555/0001-22', corporate_name: 'Omicron Tech Ltda', fantasy_name: 'Omicron Tech', email: 'contato@omicron.com', phone: '(48) 85555-0015', carrier: 'Tim', created_at: '', updated_at: '' },
    { id: 16, remote_id: 16, is_sync: true, cpf_cnpj: '54.555.666/0001-33', corporate_name: 'Pi Alimentos S.A.', fantasy_name: 'Pi Food', email: 'contato@pi.com', phone: '(27) 84444-0016', carrier: 'Oi', created_at: '', updated_at: '' },
    { id: 17, remote_id: 17, is_sync: true, cpf_cnpj: '65.666.777/0001-44', corporate_name: 'Rho Logística ME', fantasy_name: 'Rho Log', email: 'contato@rho.com', phone: '(31) 83333-0017', carrier: 'Vivo', created_at: '', updated_at: '' },
    { id: 18, remote_id: 18, is_sync: true, cpf_cnpj: '76.777.888/0001-55', corporate_name: 'Sigma Construção Ltda', fantasy_name: 'Sigma Build', email: 'contato@sigma.com', phone: '(21) 82222-0018', carrier: 'Claro', created_at: '', updated_at: '' },
    { id: 19, remote_id: 19, is_sync: true, cpf_cnpj: '87.888.999/0001-66', corporate_name: 'Tau Consultoria ME', fantasy_name: 'Tau Consult', email: 'contato@tau.com', phone: '(11) 81111-0019', carrier: 'Tim', created_at: '', updated_at: '' },
    { id: 20, remote_id: 20, is_sync: true, cpf_cnpj: '98.999.000/0001-77', corporate_name: 'Upsilon Serviços Ltda', fantasy_name: 'Upsilon Serv', email: 'contato@upsilon.com', phone: '(41) 80000-0020', carrier: 'Oi', created_at: '', updated_at: '' },
]);

function onClientConfirmed(client: Client): void {
    orderCreateSelectedClient.value = client;
    orderCreateClientFantasyName.value = client.fantasy_name;
    orderCreateClientCpfCnpj.value = client.cpf_cnpj;
    void navigateBack();
}

function onConfirm(): void {
    if (!selectedClient.value) return;
    onClientConfirmed(selectedClient.value);
}
</script>
