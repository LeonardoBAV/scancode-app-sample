<template>
    <Page actionBarHidden="true">
        <GridLayout rows="*, auto" columns="*">
            <ScrollView row="0" col="0" class="scroll-wrap">
                <StackLayout class="client-show-page bottom-pad">
                    <GridLayout rows="auto" columns="auto, *" class="header">
                        <Label row="0" col="1" :text="headerTitle" class="header-title" />
                    </GridLayout>

                    <!-- Detalhes do cliente -->
                    <StackLayout class="details-section p-4">
                        <StackLayout class="detail-card" v-if="client">
                            <Label text="Nome fantasia" class="detail-label" />
                            <Label :text="client.fantasy_name || '—'" class="detail-value" />
                        </StackLayout>
                        <StackLayout class="detail-card" v-if="client">
                            <Label text="Razão social" class="detail-label" />
                            <Label :text="client.corporate_name || '—'" class="detail-value" />
                        </StackLayout>
                        <StackLayout class="detail-card" v-if="client">
                            <Label text="CPF/CNPJ" class="detail-label" />
                            <Label :text="client.cpf_cnpj || '—'" class="detail-value" />
                        </StackLayout>
                        <StackLayout class="detail-card" v-if="client">
                            <Label text="E-mail" class="detail-label" />
                            <Label :text="client.email || '—'" class="detail-value" />
                        </StackLayout>
                        <StackLayout class="detail-card" v-if="client">
                            <Label text="Telefone" class="detail-label" />
                            <Label :text="client.phone || '—'" class="detail-value" />
                        </StackLayout>
                        <StackLayout class="detail-card" v-if="client">
                            <Label text="Operadora" class="detail-label" />
                            <Label :text="client.carrier || '—'" class="detail-value" />
                        </StackLayout>
                        <StackLayout v-if="!client" class="detail-card">
                            <Label text="Nenhum cliente selecionado." class="detail-value muted" />
                        </StackLayout>

                        <Button text="Alterar cliente" class="btn-change-client mt-3" @tap="goToClientList" />
                    </StackLayout>
                </StackLayout>
            </ScrollView>

            <!-- Flutuante em baixo: Buyer Name + Buyer Contact -->
            <StackLayout row="1" col="0" class="footer-float" verticalAlignment="bottom">
                <StackLayout class="footer-fields">
                    <Label text="Buyer Name" class="footer-field-label" />
                    <TextField v-model="buyerName" hint="Buyer Name" class="footer-input" />
                    <Label text="Buyer Contact" class="footer-field-label" />
                    <TextField v-model="buyerContact" hint="Buyer Contact" class="footer-input" />
                </StackLayout>
            </StackLayout>
        </GridLayout>
    </Page>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue';
import type { Client } from '../../../types/client';
import OrderClientListPage from './OrderClientListPage.vue';

const headerTitle: string = 'Client Details';

/** Cliente hardcoded para exibição na página. */
const client = ref<Client>({
    id: 1,
    cpf_cnpj: '12.345.678/0001-90',
    corporate_name: 'Alpha2 Comércio Ltda',
    fantasy_name: 'Alpha Store',
    email: 'contato@alpha.com',
    phone: '(11) 99999-0001',
    carrier: 'Vivo',
});

const buyerName = ref('');
const buyerContact = ref('');

const instance = getCurrentInstance();
const globals = instance?.appContext.config.globalProperties;
const navigateTo = globals?.$navigateTo as (target: unknown) => void;
const navigateBack = globals?.$navigateBack as () => void;

function goBack(): void {
    navigateBack?.();
}

function goToClientList(): void {
    navigateTo?.(OrderClientListPage);
}
</script>

<style scoped>
.client-show-page {
    background-color: #f1f5f9;
}

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

.details-section {
    padding-bottom: 16;
}

.detail-card {
    background-color: white;
    border-radius: 12;
    padding: 14;
    margin-bottom: 10;
    border-width: 1;
    border-color: #e2e8f0;
}

.detail-label {
    font-size: 12;
    color: #64748b;
    margin-bottom: 4;
}

.detail-value {
    font-size: 16;
    font-weight: 600;
    color: #0f172a;
}

.detail-value.muted {
    font-weight: normal;
    color: #94a3b8;
}

.btn-change-client {
    background-color: #3b82f6;
    color: white;
    border-radius: 10;
    padding: 14;
    font-size: 16;
    font-weight: 600;
}

.scroll-wrap {
    background-color: #f1f5f9;
}

.bottom-pad {
    padding-bottom: 24;
}

.footer-float {
    background-color: white;
    padding: 16;
    border-top-width: 2;
    border-top-color: #e2e8f0;
}

.footer-fields {
    padding-bottom: 8;
}

.footer-field-label {
    font-size: 12;
    color: #64748b;
    margin-bottom: 4;
    margin-top: 8;
}

.footer-field-label:first-child {
    margin-top: 0;
}

.footer-input {
    font-size: 16;
    padding: 12;
    border-width: 1;
    border-color: #e2e8f0;
    border-radius: 8;
}

.mt-3 {
    margin-top: 12;
}
</style>
