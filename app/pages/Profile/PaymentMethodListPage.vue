<template>
    <Page actionBarHidden="true">
        <GridLayout :rows="selectedPaymentMethod ? 'auto, *, auto' : 'auto, *'" class="bg-background">
            <HeaderComponent row="0" :title="$t('pages.paymentMethodList.title')" :showAvatar="false" />
            <PaymentMethodListComponent row="1" :payment-methods="paymentMethods" :selected-payment-method-id="selectedPaymentMethod?.id ?? null" @select="onSelectPaymentMethod" />

            <StackLayout v-if="selectedPaymentMethod" row="2" class="footer-bar">
                <Button :text="lucide('eye')" class="btn-icon lucide" @tap="onViewTap" />
            </StackLayout>
        </GridLayout>
    </Page>
</template>

<script setup lang="ts">
// --- Imports ---
import { computed, type ComputedRef, ref, type Ref } from 'vue';
import type { PaymentMethod } from '../../types/schema/payment-method';
import { PaymentMethodsComposable } from '../../composables/payment-methods-composable';
import { lucide } from '../../utils/icons';
import { useNavigation } from '../../composables/useNavigation';
import PaymentMethodListComponent from '../../components/PaymentMethodListComponent.vue';
import PaymentMethodShowPage from './PaymentMethodShowPage.vue';
import HeaderComponent from '../../components/HeaderComponent.vue';


// --- Component logic ---
const { navigateTo } = useNavigation();

const paymentMethodsFromStore = PaymentMethodsComposable.getList();

const selectedPaymentMethod: Ref<PaymentMethod | null> = ref<PaymentMethod | null>(null);

const paymentMethods: ComputedRef<PaymentMethod[]> = computed(() =>
    paymentMethodsFromStore.value.map((m: PaymentMethod): PaymentMethod => ({ ...m })),
);

function onSelectPaymentMethod(paymentMethod: PaymentMethod): void {
    selectedPaymentMethod.value = selectedPaymentMethod.value?.id === paymentMethod.id ? null : paymentMethod;
}

function onViewTap(): void {
    if (!selectedPaymentMethod.value) return;
    navigateTo(PaymentMethodShowPage, {
        props: { paymentMethod: selectedPaymentMethod.value },
        transition: { name: 'slideLeft', duration: 300 },
    });
}
</script>
