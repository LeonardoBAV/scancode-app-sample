<template>
    <Page actionBarHidden="true">
        <GridLayout rows="auto, auto, *" class="bg-background">

            <HeaderComponent row="0" :title="$t('pages.paymentMethodList.title')" :showAvatar="false" />

            <!-- Search -->
            <StackLayout row="1" class="px-4 pt-4 pb-2">
                <GridLayout columns="auto, *" class="input-search">
                    <Label col="0" :text="lucide('search')" class="lucide text-muted-foreground mr-3" verticalAlignment="center" />
                    <TextField
                        col="1"
                        v-model="searchQuery"
                        :hint="$t('pages.paymentMethodList.searchHint')"
                        class="text-base text-foreground p-0"
                        placeholderColor="#a1a1aa"
                    />
                </GridLayout>
            </StackLayout>

            <!-- List -->
            <ListView row="2" :items="filteredPaymentMethods" separatorColor="transparent">
                <template #default="{ item }">
                    <GridLayout columns="auto, *" class="p-4 mx-4 mb-2 bg-card border border-border rounded-lg">
                        <Label col="0" :text="lucide('credit-card')" class="lucide text-muted-foreground mr-4" verticalAlignment="center" />
                        <Label col="1" :text="item.name" class="text-base font-medium text-card-foreground" verticalAlignment="center" />
                    </GridLayout>
                </template>
            </ListView>

            <!-- Empty state -->
            <StackLayout v-if="filteredPaymentMethods.length === 0" row="2" class="p-8" verticalAlignment="center" horizontalAlignment="center">
                <Label :text="lucide('credit-card')" class="lucide text-muted-foreground text-4xl text-center mb-4" />
                <Label :text="$t('pages.paymentMethodList.empty')" class="text-lg font-semibold text-foreground text-center mb-2" />
                <Label :text="$t('pages.paymentMethodList.emptyHint')" class="text-sm text-muted-foreground text-center" textWrap="true" />
            </StackLayout>

        </GridLayout>
    </Page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { PaymentMethod } from '../../types/payment-method';
import { lucide } from '../../utils/icons';
import HeaderComponent from '../../components/HeaderComponent.vue';

const searchQuery = ref('');

const paymentMethods = ref<PaymentMethod[]>([
    { id: 1, name: 'Credit card' },
    { id: 2, name: 'Debit card' },
    { id: 3, name: 'PIX' },
    { id: 4, name: 'Cash' },
    { id: 5, name: 'Bank transfer' },
    { id: 6, name: 'Check' },
    { id: 7, name: 'Voucher' },
    { id: 8, name: 'Mobile payment' },
    { id: 9, name: 'PayPal' },
    { id: 10, name: 'Installment' },
    { id: 11, name: 'Boleto' },
    { id: 12, name: 'Wire transfer' },
    { id: 13, name: 'Gift card' },
    { id: 14, name: 'Cryptocurrency' },
    { id: 15, name: 'Open tab' },
    { id: 16, name: 'Corporate card' },
    { id: 17, name: 'Prepaid card' },
    { id: 18, name: 'Digital wallet' },
    { id: 19, name: 'Split payment' },
    { id: 20, name: 'Trade-in' },
]);

const filteredPaymentMethods = computed(() => {
    const term = searchQuery.value.trim().toLowerCase();
    if (!term) return paymentMethods.value;
    return paymentMethods.value.filter((p: PaymentMethod) => p.name.toLowerCase().includes(term));
});
</script>
