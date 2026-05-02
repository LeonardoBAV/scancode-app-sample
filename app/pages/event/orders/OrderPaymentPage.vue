<template>
    <Page actionBarHidden="true">
        <GridLayout rows="auto, *, auto" class="bg-background">
            <HeaderComponent row="0" :title="$t('pages.orderPayment.title')" :showAvatar="false" />

            <PaymentMethodListComponent row="1" :payment-methods="paymentMethods" :selected-payment-method-id="selectedPayment?.id ?? null" @select="onSelectPaymentMethod" />

            <StackLayout row="2" class="footer-bar">
                <Button
                    :text="$t('pages.orderPayment.confirm')"
                    :class="selectedPayment && !isSaving ? 'btn-primary' : 'btn-primary opacity-50'"
                    :isEnabled="!!selectedPayment && !isSaving"
                    @tap="onConfirm"
                />
            </StackLayout>
        </GridLayout>
    </Page>
</template>

<script setup lang="ts">
// --- Imports ---
import { computed, type ComputedRef, ref, type Ref, watch } from 'vue';
import type { PaymentMethod } from '../../../types/schema/payment-method';
import { PaymentMethodsComposable } from '../../../composables/payment-methods-composable';
import { useNavigation } from '../../../composables/useNavigation';
import PaymentMethodListComponent from '../../../components/PaymentMethodListComponent.vue';
import HeaderComponent from '../../../components/HeaderComponent.vue';
import { useCurrentOrder } from '../../../composables/repository/useCurrentOrder';
import { OrdersRepository } from '../../../db/repositories/orders.repo';


// --- Component logic ---
const { navigateBack } = useNavigation();

const paymentMethodsFromStore = PaymentMethodsComposable.getList();
const currentOrder = useCurrentOrder.getOrder();

const selectedPayment: Ref<PaymentMethod | null> = ref<PaymentMethod | null>(null);
const isSaving: Ref<boolean> = ref<boolean>(false);

const paymentMethods: ComputedRef<PaymentMethod[]> = computed(() =>
    paymentMethodsFromStore.value.map((m: PaymentMethod): PaymentMethod => ({ ...m })),
);

watch(
    [paymentMethodsFromStore, currentOrder],
    ([methods, order]): void => {
        if (isSaving.value) return;
        const desiredId: number | null = order?.payment_method_id ?? null;
        if (desiredId == null) {
            selectedPayment.value = null;
            return;
        }
        selectedPayment.value = methods.find((m: PaymentMethod): boolean => m.id === desiredId) ?? null;
    },
    { immediate: true },
);

async function onSelectPaymentMethod(paymentMethod: PaymentMethod): Promise<void> {
    if (isSaving.value) return;
    const orderId: number | undefined = currentOrder.value?.id ?? undefined;
    if (!orderId) return;

    const nextSelected: PaymentMethod | null =
        selectedPayment.value?.id === paymentMethod.id ? null : paymentMethod;
    selectedPayment.value = nextSelected;

    isSaving.value = true;
    try {
        await OrdersRepository.updatePaymentMethodId(orderId, nextSelected?.id ?? null);
        await useCurrentOrder.refresh();
    } finally {
        isSaving.value = false;
    }
}

function onConfirm(): void {
    if (!selectedPayment.value) return;
    void navigateBack();
}
</script>
