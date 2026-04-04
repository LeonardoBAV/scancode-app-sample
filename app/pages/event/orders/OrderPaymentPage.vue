<template>
    <Page actionBarHidden="true">
        <GridLayout rows="auto, *, auto" class="bg-background">
            <HeaderComponent row="0" :title="$t('pages.orderPayment.title')" :showAvatar="false" />

            <PaymentMethodListComponent row="1" :payment-methods="paymentMethods" :selected-payment-method-id="selectedPayment?.id ?? null" @select="onSelectPaymentMethod" />

            <StackLayout row="2" class="footer-bar">
                <Button
                    :text="$t('pages.orderPayment.confirm')"
                    :class="selectedPayment ? 'btn-primary' : 'btn-primary opacity-50'"
                    :isEnabled="!!selectedPayment"
                    @tap="onConfirm"
                />
            </StackLayout>
        </GridLayout>
    </Page>
</template>

<script setup lang="ts">
// --- Imports ---
import { ref } from 'vue';
import type { PaymentMethod } from '../../../types/payment-method';
import { orderCreatePaymentMethodName } from './order-create-state';
import { useNavigation } from '../../../composables/useNavigation';
import PaymentMethodListComponent from '../../../components/PaymentMethodListComponent.vue';
import HeaderComponent from '../../../components/HeaderComponent.vue';


// --- Component logic ---
const selectedPayment = ref<PaymentMethod | null>(null);

const { navigateBack } = useNavigation();

function onSelectPaymentMethod(paymentMethod: PaymentMethod): void {
    selectedPayment.value = selectedPayment.value?.id === paymentMethod.id ? null : paymentMethod;
}

function onConfirm(): void {
    if (!selectedPayment.value) return;
    orderCreatePaymentMethodName.value = selectedPayment.value.name;
    void navigateBack();
}

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
</script>
