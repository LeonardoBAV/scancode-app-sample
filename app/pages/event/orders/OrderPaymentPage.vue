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
import { computed, type ComputedRef, ref, type Ref } from 'vue';
import type { PaymentMethod } from '../../../types/schema/payment-method';
import { PaymentMethodsComposable } from '../../../composables/payment-methods-composable';
import { useNavigation } from '../../../composables/useNavigation';
import PaymentMethodListComponent from '../../../components/PaymentMethodListComponent.vue';
import HeaderComponent from '../../../components/HeaderComponent.vue';


// --- Component logic ---
const { navigateBack } = useNavigation();

const paymentMethodsFromStore = PaymentMethodsComposable.getList();

const selectedPayment: Ref<PaymentMethod | null> = ref<PaymentMethod | null>(null);

const paymentMethods: ComputedRef<PaymentMethod[]> = computed(() =>
    paymentMethodsFromStore.value.map((m: PaymentMethod): PaymentMethod => ({ ...m })),
);

function onSelectPaymentMethod(paymentMethod: PaymentMethod): void {
    selectedPayment.value = selectedPayment.value?.id === paymentMethod.id ? null : paymentMethod;
}

function onConfirm(): void {
    if (!selectedPayment.value) return;
    // TODO: persist selectedPayment.value.id on the current order (e.g. OrdersRepository) so OrderShowPage reflects it.
    void navigateBack();
}
</script>
