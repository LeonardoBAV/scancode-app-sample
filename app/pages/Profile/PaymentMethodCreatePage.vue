<template>
    <Page actionBarHidden="true">
        <GridLayout rows="auto, *" class="bg-background">
            <HeaderComponent row="0" :title="$t('pages.paymentMethodCreate.title')" :showAvatar="false" />

            <PaymentMethodFormComponent row="1" :payment-method="paymentMethodDraft" @save="createPaymentMethod" />
        </GridLayout>
    </Page>
</template>

<script setup lang="ts">
// --- Imports ---
import { ref, type Ref } from 'vue';
import { PaymentMethodsRepository } from '../../db/repositories/payment-methods.repo';
import { showToast } from '../../composables/toast-state';
import { useTranslation } from '../../composables/useTranslation';
import { useNavigation } from '../../composables/useNavigation';
import type { PaymentMethod } from '../../types/schema/payment-method';
import PaymentMethodFormComponent from '../../components/PaymentMethodFormComponent.vue';
import HeaderComponent from '../../components/HeaderComponent.vue';


// --- Component logic ---
const { t } = useTranslation();
const { navigateBack } = useNavigation();

const paymentMethodDraft: Ref<PaymentMethod> = ref<PaymentMethod>({
    id: null,
    remote_id: null,
    is_sync: false,
    name: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
});

async function createPaymentMethod(paymentMethod: PaymentMethod): Promise<void> {
    try {
        await PaymentMethodsRepository.upsertOne(paymentMethod);
        showToast({
            message: t('pages.paymentMethodForm.saveSuccess'),
            variant: 'success',
        });
        navigateBack();
    } catch (e: unknown) {
        console.error('[PaymentMethodCreatePage] create payment method failed:', e);
        showToast({
            message: t('pages.paymentMethodForm.saveError'),
            variant: 'error',
        });
    }
}
</script>
