<template>
    <StackLayout class="p-4 pb-8">
        <StackLayout class="card p-0" androidElevation="2">
            <StackLayout class="p-4">
                <StackLayout v-if="paymentMethod" horizontalAlignment="right" class="mb-3">
                    <Label
                        :text="paymentMethod.is_sync ? $t('common.syncBadgeSynced') : $t('common.syncBadgePending')"
                        :class="paymentMethod.is_sync ? 'badge-success' : 'badge-secondary'"
                        horizontalAlignment="right"
                    />
                </StackLayout>
                <Label :text="$t('pages.paymentMethodShow.name')" class="text-xs text-muted-foreground mb-1" />
                <Label :text="paymentMethod?.name ?? '—'" class="text-base font-semibold text-card-foreground" textWrap="true" />
            </StackLayout>
        </StackLayout>
    </StackLayout>
</template>

<script setup lang="ts">
// --- Imports ---
import type { PaymentMethod } from '../types/schema/payment-method';


// --- Component logic ---
defineProps<{
    paymentMethod: PaymentMethod | null;
}>();
</script>
