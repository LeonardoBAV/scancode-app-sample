<template>
    <Page actionBarHidden="true">
        <GridLayout rows="auto, *" class="bg-background">
            <HeaderComponent row="0" :title="paymentMethod?.name ?? $t('pages.paymentMethodShow.title')" :showAvatar="false" />

            <ScrollView row="1">
                <StackLayout class="p-4 pb-8">
                    <StackLayout class="card p-0" androidElevation="2">
                        <StackLayout class="p-4">
                            <Label :text="$t('pages.paymentMethodShow.name')" class="text-xs text-muted-foreground mb-1" />
                            <Label :text="paymentMethod?.name ?? '—'" class="text-base font-semibold text-card-foreground" textWrap="true" />
                        </StackLayout>
                    </StackLayout>
                </StackLayout>
            </ScrollView>
        </GridLayout>
    </Page>
</template>

<script setup lang="ts">
// --- Imports ---
import type { PaymentMethod } from '../../types/schema/payment-method';
import HeaderComponent from '../../components/HeaderComponent.vue';


// --- Component logic ---
defineProps<{
    paymentMethod: PaymentMethod | null;
}>();
</script>
