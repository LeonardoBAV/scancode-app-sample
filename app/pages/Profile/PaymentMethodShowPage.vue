<template>
    <Page actionBarHidden="true">
        <GridLayout rows="*" columns="*" class="bg-background">
            <GridLayout row="0" col="0" rows="auto, auto, *" class="bg-background">
                <HeaderComponent row="0" :title="headerTitle" :showAvatar="false" />

                <CustomSegmentedBarComponent
                    v-model="selectedSegment"
                    row="1"
                    class="mx-4 mt-2 mb-2"
                    leftLabelKey="pages.paymentMethodShow.segmentView"
                    rightLabelKey="pages.paymentMethodShow.segmentEdit"
                />

                <ScrollView row="2">
                    <PaymentMethodInfoComponent v-if="selectedSegment === 0" :payment-method="localPaymentMethod" />
                    <PaymentMethodFormComponent v-else :payment-method="localPaymentMethod" @save="onPaymentMethodFormSave" />
                </ScrollView>
            </GridLayout>

            <ToastHostComponent row="0" col="0" verticalAlignment="bottom" horizontalAlignment="stretch" />
        </GridLayout>
    </Page>
</template>

<script setup lang="ts">
// --- Imports ---
import { computed, ref, watch, type ComputedRef, type Ref } from 'vue';
import { PaymentMethodsRepository } from '../../db/repositories/payment-methods.repo';
import { showToast } from '../../composables/toast-state';
import { useTranslation } from '../../composables/useTranslation';
import { Haptics } from '../../utils/haptics';
import type { PaymentMethod } from '../../types/schema/payment-method';
import CustomSegmentedBarComponent from '../../components/CustomSegmentedBarComponent.vue';
import ToastHostComponent from '../../components/ToastHostComponent.vue';
import PaymentMethodFormComponent from '../../components/PaymentMethodFormComponent.vue';
import PaymentMethodInfoComponent from '../../components/PaymentMethodInfoComponent.vue';
import HeaderComponent from '../../components/HeaderComponent.vue';


// --- Component logic ---
const props = defineProps<{
    paymentMethod: PaymentMethod;
}>();

const { t } = useTranslation();

const selectedSegment: Ref<number> = ref(0);
const localPaymentMethod: Ref<PaymentMethod> = ref(props.paymentMethod);

watch(
    () => props.paymentMethod,
    (m: PaymentMethod) => {
        localPaymentMethod.value = m;
    },
    { immediate: true },
);

const headerTitle: ComputedRef<string> = computed(() => {
    const n: string = localPaymentMethod.value.name.trim();
    return n.length > 0 ? n : t('pages.paymentMethodShow.title');
});

async function onPaymentMethodFormSave(method: PaymentMethod): Promise<void> {
    try {
        await PaymentMethodsRepository.upsertOne(method);
        localPaymentMethod.value = method;
        Haptics.vibrateSuccess();
        showToast({
            message: t('pages.paymentMethodForm.saveSuccess'),
            variant: 'success',
        });
        selectedSegment.value = 0;
    } catch (e: unknown) {
        console.error('[PaymentMethodShowPage] save failed:', e);
        showToast({
            message: t('pages.paymentMethodForm.saveError'),
            variant: 'error',
        });
    }
}
</script>
