<template>
    <Page actionBarHidden="true">
        <ScrollView>
            <StackLayout class="p-4">
                <GridLayout rows="auto, auto, auto, auto, auto" columns="auto, *" class="mb-4">
                    <Label row="0" col="0" text="Id do pedido" class="text-sm text-gray-500 mr-2" />
                    <Label row="0" col="1" :text="orderId" class="text-base font-semibold text-gray-900" />

                    <Label row="1" col="0" text="Cliente Nome fantasia" class="text-sm text-gray-500 mr-2 mt-2" />
                    <TextField row="1" col="1" v-model="clientFantasyName" hint="Nome fantasia" class="input mt-2 p-2 border border-gray-300 rounded" />

                    <Label row="2" col="0" text="Cliente CPF/CNPJ" class="text-sm text-gray-500 mr-2 mt-2" />
                    <TextField row="2" col="1" v-model="clientCpfCnpj" hint="CPF ou CNPJ" class="input mt-2 p-2 border border-gray-300 rounded" />

                    <Label row="3" col="0" text="Valor do pedido" class="text-sm text-gray-500 mr-2 mt-2" />
                    <TextField row="3" col="1" v-model.number="orderValue" hint="Ex: 99,90" keyboardType="number" class="input mt-2 p-2 border border-gray-300 rounded" />

                    <Label row="4" col="0" text="Total de itens" class="text-sm text-gray-500 mr-2 mt-2" />
                    <TextField row="4" col="1" v-model.number="totalItems" hint="0" keyboardType="number" class="input mt-2 p-2 border border-gray-300 rounded" />
                </GridLayout>

                <Button text="Pagamento" class="btn-secondary mb-3" @tap="goToPayment" />
                <Button text="Comprador" class="btn-secondary mb-3" @tap="goToBuyer" />
                <Button text="Observação" class="btn-secondary mb-4" @tap="goToNotes" />

                <GridLayout columns="*" rows="auto" class="m-t-4">
                    <Button col="0" row="0" text="🖨" class="btn-print" @tap="onPrint" />
                </GridLayout>
            </StackLayout>
        </ScrollView>
    </Page>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue';
import OrderPaymentPage from './OrderPaymentPage.vue';
import OrderBuyerPage from './OrderBuyerPage.vue';
import OrderNotesPage from './OrderNotesPage.vue';

const orderId = ref('ORD-NEW');
const clientFantasyName = ref('');
const clientCpfCnpj = ref('');
const orderValue = ref(0);
const totalItems = ref(0);

const instance = getCurrentInstance();
const globals = instance?.appContext.config.globalProperties;
const navigateTo = globals?.$navigateTo as (target: unknown, options?: Record<string, unknown>) => void;
const navigateBack = globals?.$navigateBack as () => void;

function goBack(): void {
    navigateBack?.();
}

function formatValor(value: number): string {
    return value === 0 ? 'R$ 0,00' : 'R$ ' + value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function goToPayment(): void {
    navigateTo?.(OrderPaymentPage);
}

function goToBuyer(): void {
    navigateTo?.(OrderBuyerPage);
}

function goToNotes(): void {
    navigateTo?.(OrderNotesPage);
}

function onPrint(): void {
    console.log('Print tapped');
}
</script>

<style scoped>
.btn-secondary {
    background-color: #475569;
    color: white;
    padding: 12;
    border-radius: 8;
    font-size: 16;
}

.btn-print {
    width: 48;
    height: 48;
    font-size: 24;
    background-color: #64748b;
    color: white;
    border-radius: 8;
    horizontal-align: right;
}
</style>
