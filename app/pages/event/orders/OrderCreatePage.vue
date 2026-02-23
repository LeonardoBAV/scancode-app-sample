<template>
    <Page actionBarHidden="true">
        <GridLayout rows="*" columns="*">
            <ScrollView row="0" col="0" class="scroll-wrap">
                <StackLayout class="order-create-page bottom-pad">
                    <!-- Custom header: ID, status badge; client block with edit button floating on the right -->
                    <StackLayout class="header">
                        <GridLayout rows="auto" columns="*, auto" class="header-row">
                            <Label row="0" col="0" :text="orderId" class="header-order-id" />
                            <StackLayout row="0" col="1" :class="'badge badge-' + orderStatus.toLowerCase()">
                                <Label :text="orderStatus === 'Open' ? 'Aberto' : 'Finalizado'" class="badge-text" />
                            </StackLayout>
                        </GridLayout>
                        <GridLayout rows="auto" columns="*, auto" class="header-client">
                            <StackLayout row="0" col="0">
                                <Label :text="clientFantasyName || '—'" class="header-client-name" />
                                <Label :text="clientCpfCnpj || '—'" class="header-client-doc" />
                            </StackLayout>
                            <Button row="0" col="1" text="✎" class="btn-change-client" @tap="goToBuyer" />
                        </GridLayout>
                    </StackLayout>

                    <!-- Destaque: Valor do pedido + Total de itens (labels, hardcoded) -->
                    <StackLayout class="section-values">
                        <GridLayout rows="auto" columns="*, *" class="values-grid">
                            <StackLayout row="0" col="0" class="value-block">
                                <Label text="Valor do pedido" class="value-label" />
                                <Label :text="displayOrderValue" class="value-display" />
                            </StackLayout>
                            <StackLayout row="0" col="1" class="value-block">
                                <Label text="Total de itens" class="value-label" />
                                <Label :text="displayTotalItems" class="value-display" />
                            </StackLayout>
                        </GridLayout>
                    </StackLayout>

                    <StackLayout class="content p-4">
                        <StackLayout class="card">
                            <Label text="Método de pagamento" class="card-label" />
                            <Label :text="paymentMethodName || '—'" class="card-value" />
                            <Button text="Escolher pagamento" class="btn-card" @tap="goToPayment" />
                        </StackLayout>

                        <StackLayout class="card">
                            <Label text="Observação" class="card-label" />
                            <TextView
                                v-model="observation"
                                hint="Toque para adicionar observação..."
                                class="input-observation"
                            />
                        </StackLayout>
                    </StackLayout>
                </StackLayout>
            </ScrollView>

            <!-- Floating bottom: Open = Finalizar + Print side by side; Completed = Print extended -->
            <StackLayout row="0" col="0" verticalAlignment="bottom" horizontalAlignment="stretch" class="footer-wrap">
                <GridLayout v-if="orderStatus === 'Open'" rows="auto" columns="*, *" class="footer-buttons">
                    <Button row="0" col="0" text="Finalizar" class="btn-finalizar" @tap="onFinish" />
                    <Button row="0" col="1" text="🖨 Imprimir" class="btn-print-float" @tap="onPrint" />
                </GridLayout>
                <Button v-else text="🖨 Imprimir" class="btn-print-extended" @tap="onPrint" />
            </StackLayout>
        </GridLayout>
    </Page>
</template>

<script setup lang="ts">
import { ref, computed, getCurrentInstance } from 'vue';
import OrderPaymentPage from './OrderPaymentPage.vue';
import OrderBuyerPage from './OrderBuyerPage.vue';
import {
    orderCreatePaymentMethodName,
    orderCreateClientFantasyName,
    orderCreateClientCpfCnpj,
} from './order-create-state';

const orderId = ref('ORD-NEW');
const observation = ref('');
const orderStatus = ref<'Open' | 'Completed'>('Open');

const displayOrderValue = 'R$ 1.250,00';
const displayTotalItems = '5 itens';

const paymentMethodName = computed(() => orderCreatePaymentMethodName.value);
const clientFantasyName = computed(() => orderCreateClientFantasyName.value);
const clientCpfCnpj = computed(() => orderCreateClientCpfCnpj.value);

const instance = getCurrentInstance();
const globals = instance?.appContext.config.globalProperties;
const navigateTo = globals?.$navigateTo as (target: unknown, options?: Record<string, unknown>) => void;
const navigateBack = globals?.$navigateBack as () => void;

function goBack(): void {
    navigateBack?.();
}

function goToPayment(): void {
    navigateTo?.(OrderPaymentPage);
}

function goToBuyer(): void {
    navigateTo?.(OrderBuyerPage);
}

function onPrint(): void {
    console.log('Print tapped');
}

function onFinish(): void {
    orderStatus.value = 'Completed';
}
</script>

<style scoped>
.order-create-page {
    background-color: #f1f5f9;
}

.header {
    background-color: #1e293b;
    color: white;
    padding: 16;
    padding-bottom: 20;
}

.header-row {
    margin-bottom: 12;
}

.header-order-id {
    font-size: 20;
    font-weight: bold;
    vertical-align: center;
}

.badge {
    padding: 8;
    padding-left: 12;
    padding-right: 12;
    border-radius: 20;
    vertical-align: center;
}

.badge-open {
    background-color: #22c55e;
}

.badge-completed {
    background-color: #64748b;
}

.badge-text {
    font-size: 12;
    font-weight: 600;
    color: white;
}

.header-client {
    background-color: rgba(255, 255, 255, 0.12);
    border-radius: 10;
    padding: 12;
    column-spacing: 12;
}

.btn-change-client {
    width: 40;
    height: 40;
    font-size: 18;
    color: #93c5fd;
    background-color: transparent;
    border-width: 1;
    border-color: rgba(255, 255, 255, 0.4);
    border-radius: 20;
    vertical-align: center;
}

.header-client-name {
    font-size: 16;
    font-weight: 600;
    color: white;
}

.header-client-doc {
    font-size: 13;
    color: rgba(255, 255, 255, 0.85);
    margin-top: 2;
}

.section-values {
    background-color: white;
    margin: 16;
    margin-bottom: 0;
    border-radius: 16;
    padding: 20;
    border-width: 2;
    border-color: #3b82f6;
}

.values-grid {
    horizontal-align: stretch;
}

.value-block {
    padding: 4;
}

.value-label {
    font-size: 12;
    color: #64748b;
    margin-bottom: 6;
}

.value-display {
    font-size: 20;
    font-weight: 700;
    color: #0f172a;
}

.content {
    padding-bottom: 24;
}

.bottom-pad {
    padding-bottom: 100;
}

.scroll-wrap {
    background-color: #f1f5f9;
}

.footer-wrap {
    padding: 16;
    margin: 12;
}

.footer-buttons {
    column-spacing: 16;
}

.btn-finalizar {
    background-color: #22c55e;
    color: white;
    border-radius: 10;
    padding: 14;
    font-size: 16;
    font-weight: 600;
    margin-right: 8;
}

.btn-print-float {
    background-color: #64748b;
    color: white;
    border-radius: 10;
    padding: 14;
    font-size: 16;
    margin-left: 8;
}

.btn-print-extended {
    background-color: #64748b;
    color: white;
    border-radius: 10;
    padding: 14;
    font-size: 16;
    horizontal-align: stretch;
}

.card {
    background-color: white;
    border-radius: 12;
    padding: 16;
    margin-bottom: 12;
}

.card-label {
    font-size: 12;
    color: #64748b;
    margin-bottom: 4;
}

.card-value {
    font-size: 16;
    font-weight: 600;
    color: #0f172a;
}

.btn-card {
    background-color: #3b82f6;
    color: white;
    border-radius: 8;
    padding: 12;
    font-size: 14;
    margin-top: 12;
}

.input-card {
    font-size: 16;
    padding: 12;
    border-width: 1;
    border-color: #e2e8f0;
    border-radius: 8;
}

.input-observation {
    font-size: 15;
    padding: 12;
    border-width: 1;
    border-color: #e2e8f0;
    border-radius: 8;
    min-height: 80;
}
</style>
