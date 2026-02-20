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
