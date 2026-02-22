<template>
    <Page actionBarHidden="true">
        <StackLayout>
            <GridLayout rows="auto" columns="auto, *" class="header">
                <Label row="0" col="0" text="←" class="header-back" @tap="goBack" />
                <Label row="0" col="1" text="Pagamento" class="header-title" />
            </GridLayout>
            <ListView :items="paymentMethods" separatorColor="transparent" class="list p-3">
                <template #default="{ item }">
                    <GridLayout
                        rows="auto"
                        columns="*"
                        class="payment-item p-3 m-2 rounded-lg"
                        @tap="selectPayment(item)"
                    >
                        <Label :text="item.name" class="text-base font-semibold text-gray-900" textWrap="true" />
                    </GridLayout>
                </template>
            </ListView>
        </StackLayout>
    </Page>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue';
import type { PaymentMethod } from '../../../types/payment-method';
import { orderCreatePaymentMethodName } from './order-create-state';

const paymentMethods = ref<PaymentMethod[]>([
    { id: 1, name: 'Credit card' },
    { id: 2, name: 'Debit card' },
    { id: 3, name: 'PIX' },
    { id: 4, name: 'Cash' },
    { id: 5, name: 'Bank transfer' },
    { id: 6, name: 'Check' },
    { id: 7, name: 'Boleto' },
    { id: 8, name: 'Mobile payment' },
]);

const instance = getCurrentInstance();
const globals = instance?.appContext.config.globalProperties;
const navigateBack = globals?.$navigateBack as () => void;

function goBack(): void {
    navigateBack?.();
}

function selectPayment(payment: PaymentMethod): void {
    orderCreatePaymentMethodName.value = payment.name;
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

.payment-item {
    background-color: #f8fafc;
    border-width: 1;
    border-color: #e2e8f0;
}
</style>
