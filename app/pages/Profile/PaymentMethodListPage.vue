<template>
    <Page>
        <ActionBar title="Payment method list">
            <NavigationButton text="Back" android.systemIcon="ic_menu_back" @tap="goBack" />
        </ActionBar>
        <ListView :items="paymentMethods" separatorColor="transparent" class="list">
            <template #default="{ item }">
                <GridLayout rows="auto" columns="*" class="payment-method-item p-3 m-2 rounded-lg border border-gray-200">
                    <Label row="0" col="0" :text="item.name" class="text-base font-bold text-gray-900" textWrap="true" />
                </GridLayout>
            </template>
        </ListView>
    </Page>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue';
import type { PaymentMethod } from '../../types/payment-method';

const paymentMethods = ref<PaymentMethod[]>([
    { id: 1, name: 'Credit card' },
    { id: 2, name: 'Debit card' },
    { id: 3, name: 'PIX' },
    { id: 4, name: 'Cash' },
    { id: 5, name: 'Bank transfer' },
    { id: 6, name: 'Check' },
    { id: 7, name: 'Voucher' },
    { id: 8, name: 'Mobile payment' },
    { id: 9, name: 'PayPal' },
    { id: 10, name: 'Installment' },
    { id: 11, name: 'Boleto' },
    { id: 12, name: 'Wire transfer' },
    { id: 13, name: 'Gift card' },
    { id: 14, name: 'Cryptocurrency' },
    { id: 15, name: 'Open tab' },
    { id: 16, name: 'Corporate card' },
    { id: 17, name: 'Prepaid card' },
    { id: 18, name: 'Digital wallet' },
    { id: 19, name: 'Split payment' },
    { id: 20, name: 'Trade-in' },
]);

const instance = getCurrentInstance();
const globals = instance?.appContext.config.globalProperties;
const navigateBack = globals?.$navigateBack as () => Promise<void> | void;

function goBack(): void {
    return navigateBack?.();
}
</script>

<style scoped>
.payment-method-item {
    background-color: #fafafa;
}
</style>
