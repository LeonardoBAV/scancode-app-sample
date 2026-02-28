<template>
    <Page actionBarHidden="true">
        <GridLayout rows="auto, *, auto" columns="*">
            <GridLayout row="0" col="0" rows="auto" columns="*" class="header">
                <Label row="0" col="0" text="Pagamento" class="header-title" />
            </GridLayout>
            <StackLayout row="1" col="0">
                <TextField
                    v-model="searchQuery"
                    hint="Buscar por nome..."
                    class="search-field p-3 m-3 rounded-lg border border-gray-300 text-base"
                />
                <ListView :items="filteredMethods" separatorColor="transparent" class="list">
                    <template #default="{ item }">
                        <GridLayout
                            rows="auto"
                            columns="*"
                            :class="['payment-item', 'p-3', 'm-2', 'rounded-lg', selectedPayment?.id === item.id ? 'payment-item-selected' : '']"
                            @tap="onSelectItem(item)"
                        >
                            <Label :text="item.name" class="text-base font-semibold text-gray-900" textWrap="true" />
                        </GridLayout>
                    </template>
                </ListView>
            </StackLayout>
            <StackLayout row="2" col="0" class="footer-float" verticalAlignment="bottom">
                <Button
                    text="Confirmar"
                    :isEnabled="!!selectedPayment"
                    :class="selectedPayment ? 'btn-confirm' : 'btn-confirm-disabled'"
                    @tap="onConfirm"
                />
            </StackLayout>
        </GridLayout>
    </Page>
</template>

<script setup lang="ts">
import { ref, computed, getCurrentInstance } from 'vue';
import type { PaymentMethod } from '../../../types/payment-method';
import { orderCreatePaymentMethodName } from './order-create-state';

function likeMatch(value: string, term: string): boolean {
    if (!term) return true;
    return value.toLowerCase().includes(term.toLowerCase());
}

const searchQuery = ref('');
const selectedPayment = ref<PaymentMethod | null>(null);

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

const filteredMethods = computed(() => {
    const term = searchQuery.value.trim();
    if (!term) return paymentMethods.value;
    return paymentMethods.value.filter((m: PaymentMethod) => likeMatch(m.name, term));
});

const instance = getCurrentInstance();
const globals = instance?.appContext.config.globalProperties;
const navigateBack = globals?.$navigateBack as () => void;

function onSelectItem(payment: PaymentMethod): void {
    selectedPayment.value = selectedPayment.value?.id === payment.id ? null : payment;
}

function onConfirm(): void {
    if (!selectedPayment.value) return;
    orderCreatePaymentMethodName.value = selectedPayment.value.name;
    navigateBack?.();
}
</script>

<style scoped>
.header {
    background-color: #1e293b;
    color: white;
    padding: 16;
}

.header-title {
    font-size: 18;
    font-weight: bold;
    vertical-align: center;
}

.search-field {
    background-color: #f8fafc;
}

.payment-item {
    background-color: #fafafa;
    border-width: 1;
    border-color: #e2e8f0;
}

.payment-item-selected {
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
