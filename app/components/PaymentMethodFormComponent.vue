<template>
    <GridLayout rows="*, auto" class="bg-background">
        <ScrollView row="0">
            <StackLayout class="p-4 pb-2">
                <StackLayout class="card p-0" androidElevation="2">
                    <StackLayout class="p-4">
                        <Label :text="$t('pages.paymentMethodShow.name')" class="text-xs text-muted-foreground mb-1" />
                        <TextField
                            v-model="name"
                            :hint="$t('pages.paymentMethodForm.nameHint')"
                            :class="inputFieldClass('name')"
                            placeholderColor="#a1a1aa"
                        />
                        <Label v-if="fieldErrors.name" :text="fieldErrors.name" textWrap="true" class="text-xs text-destructive mt-1" />
                    </StackLayout>
                </StackLayout>
            </StackLayout>
        </ScrollView>

        <StackLayout row="1" class="footer-bar" androidElevation="2" iosElevation="2">
            <Button :text="$t('pages.paymentMethodForm.save')" class="btn-primary w-full" horizontalAlignment="stretch" @tap="onSave" />
        </StackLayout>
    </GridLayout>
</template>

<script setup lang="ts">
// --- Imports ---
import { ref, watch, type Ref } from 'vue';
import { usePaymentMethodFormValidation } from '../composables/usePaymentMethodFormValidation';
import type { PaymentMethodFormFieldKey, PaymentMethodFormFields } from '../validation/payment-method-form-validation';
import type { PaymentMethod } from '../types/schema/payment-method';


// --- Component logic ---
const props = defineProps<{
    paymentMethod: PaymentMethod;
}>();

const emit = defineEmits<{
    save: [paymentMethod: PaymentMethod];
}>();

const fieldErrors = usePaymentMethodFormValidation.fieldErrors;

const name: Ref<string> = ref('');

watch(
    () => props.paymentMethod,
    (m: PaymentMethod) => {
        applyToFields(m);
        usePaymentMethodFormValidation.clearFieldErrors();
    },
    { immediate: true },
);

async function onSave(): Promise<void> {
    const validated: PaymentMethodFormFields | null = await validateForm();
    if (!validated) {
        return;
    }
    const next: PaymentMethod = {
        ...props.paymentMethod,
        name: validated.name,
        is_sync: false,
    };
    emit('save', next);
}

function applyToFields(m: PaymentMethod): void {
    name.value = m.name ?? '';
}

async function validateForm(): Promise<PaymentMethodFormFields | null> {
    return await usePaymentMethodFormValidation.validatePaymentMethodForm(
        { name: name.value },
        { ignorePaymentMethodId: props.paymentMethod.id },
    );
}

function inputFieldClass(field: PaymentMethodFormFieldKey): string {
    const message: string | undefined = fieldErrors.value[field];
    return message !== undefined && message !== '' ? 'input-field-invalid' : 'input-field';
}
</script>
