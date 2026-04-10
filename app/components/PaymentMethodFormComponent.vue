<template>
    <GridLayout rows="*, auto" class="bg-background">
        <ScrollView row="0">
            <StackLayout class="p-4 pb-2">
                <StackLayout class="card p-0" androidElevation="2">
                    <StackLayout class="p-4">
                        <Label :text="$t('pages.paymentMethodShow.name')" class="text-xs text-muted-foreground mb-1" />
                        <TextField v-model="name" :hint="$t('pages.paymentMethodForm.nameHint')" class="input-field" placeholderColor="#a1a1aa" />
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
import type { PaymentMethod } from '../types/schema/payment-method';


// --- Component logic ---
const props = defineProps<{
    paymentMethod: PaymentMethod;
}>();

const emit = defineEmits<{
    save: [paymentMethod: PaymentMethod];
}>();

const name: Ref<string> = ref('');

function applyToFields(m: PaymentMethod): void {
    name.value = m.name ?? '';
}

watch(
    () => props.paymentMethod,
    (m: PaymentMethod) => {
        applyToFields(m);
    },
    { immediate: true },
);

function onSave(): void {
    const base: PaymentMethod = props.paymentMethod;
    const next: PaymentMethod = {
        ...base,
        name: name.value.trim(),
        is_sync: false,
    };
    emit('save', next);
}
</script>
