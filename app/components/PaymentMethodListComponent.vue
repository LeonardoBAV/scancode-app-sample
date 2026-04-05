<template>
    <GridLayout rows="auto, *" class="bg-background">
        <!-- Search -->
        <StackLayout row="0" class="px-4 pt-2 pb-2">
            <GridLayout columns="auto, *" class="input-search">
                <Label col="0" :text="lucide('search')" class="lucide text-muted-foreground mr-3" verticalAlignment="center" />
                <TextField col="1" v-model="searchQuery" :hint="$t('pages.paymentMethodList.searchHint')" class="text-base text-foreground p-0" placeholderColor="#a1a1aa" />
            </GridLayout>
        </StackLayout>

        <!-- List -->
        <ListView v-if="filteredPaymentMethods.length > 0" row="1" :items="filteredPaymentMethods" separatorColor="transparent">
            <template #default="{ item }">
                <GridLayout
                    columns="auto, *"
                    :class="['p-4 mx-4 mb-2 border rounded-lg', selectedPaymentMethodId === item.id ? 'bg-primary border-primary' : 'bg-card border-border']"
                    @tap="$emit('select', item)"
                >
                    <Label col="0" :text="lucide('credit-card')" :class="['lucide mr-4', selectedPaymentMethodId === item.id ? 'text-primary-foreground' : 'text-muted-foreground']" verticalAlignment="center" />
                    <Label col="1" :text="item.name" :class="['text-base font-medium', selectedPaymentMethodId === item.id ? 'text-primary-foreground' : 'text-card-foreground']" verticalAlignment="center" />
                </GridLayout>
            </template>
        </ListView>

        <!-- Empty state -->
        <StackLayout v-else row="1" class="p-8" verticalAlignment="center" horizontalAlignment="center">
            <Label :text="lucide('credit-card')" class="lucide text-muted-foreground text-4xl text-center mb-4" />
            <Label :text="$t('pages.paymentMethodList.empty')" class="text-lg font-semibold text-foreground text-center mb-2" />
            <Label :text="$t('pages.paymentMethodList.emptyHint')" class="text-sm text-muted-foreground text-center" textWrap="true" />
        </StackLayout>
    </GridLayout>
</template>

<script setup lang="ts">
// --- Imports ---
import { ref, computed } from 'vue';
import type { PaymentMethod } from '../types/schema/payment-method';
import { lucide } from '../utils/icons';


// --- Component logic ---
const props = defineProps<{
    paymentMethods: PaymentMethod[];
    selectedPaymentMethodId: number | null;
}>();

defineEmits<{
    (e: 'select', paymentMethod: PaymentMethod): void;
}>();

const searchQuery = ref('');

const filteredPaymentMethods = computed(() => {
    const term = searchQuery.value.trim().toLowerCase();
    if (!term) return props.paymentMethods;
    return props.paymentMethods.filter((p: PaymentMethod) => p.name.toLowerCase().includes(term));
});
</script>
