<template>
    <StackLayout class="p-4 pb-8">
        <StackLayout class="card p-0" androidElevation="2">
            <StackLayout class="p-4">
                <StackLayout v-if="client" horizontalAlignment="right" class="mb-3">
                    <Label
                        :text="client.is_sync ? $t('common.syncBadgeSynced') : $t('common.syncBadgePending')"
                        :class="client.is_sync ? 'badge-success' : 'badge-secondary'"
                        horizontalAlignment="right"
                    />
                </StackLayout>
                <Label :text="$t('pages.orderClientShow.fantasyName')" class="text-xs text-muted-foreground mb-1" />
                <Label :text="client?.fantasy_name ?? '—'" class="text-base font-semibold text-card-foreground" textWrap="true" />
            </StackLayout>
            <StackLayout class="bg-border mx-4" style="height: 1" />
            <StackLayout class="p-4">
                <Label :text="$t('pages.orderClientShow.corporateName')" class="text-xs text-muted-foreground mb-1" />
                <Label :text="client?.corporate_name ?? '—'" class="text-base font-semibold text-card-foreground" textWrap="true" />
            </StackLayout>
            <StackLayout class="bg-border mx-4" style="height: 1" />
            <StackLayout class="p-4">
                <Label :text="$t('pages.orderClientShow.cpfCnpj')" class="text-xs text-muted-foreground mb-1" />
                <Label :text="Format.formatCPFCNPJ(client?.cpf_cnpj ?? '')" class="text-base font-semibold text-card-foreground" textWrap="true" />
            </StackLayout>
            <StackLayout class="bg-border mx-4" style="height: 1" />
            <StackLayout class="p-4">
                <Label :text="$t('pages.orderClientShow.email')" class="text-xs text-muted-foreground mb-1" />
                <Label :text="displayOrDash(client?.email)" class="text-base font-semibold text-card-foreground" textWrap="true" />
            </StackLayout>
            <StackLayout class="bg-border mx-4" style="height: 1" />
            <StackLayout class="p-4">
                <Label :text="$t('pages.orderClientShow.phone')" class="text-xs text-muted-foreground mb-1" />
                <Label :text="displayOrDash(client?.phone)" class="text-base font-semibold text-card-foreground" textWrap="true" />
            </StackLayout>
            <StackLayout class="bg-border mx-4" style="height: 1" />
            <StackLayout class="p-4">
                <Label :text="$t('pages.orderClientShow.buyerName')" class="text-xs text-muted-foreground mb-1" />
                <Label :text="buyerNameLabel" class="text-base font-semibold text-card-foreground" textWrap="true" />
            </StackLayout>
            <StackLayout class="bg-border mx-4" style="height: 1" />
            <StackLayout class="p-4">
                <Label :text="$t('pages.orderClientShow.buyerContact')" class="text-xs text-muted-foreground mb-1" />
                <Label :text="buyerContactLabel" class="text-base font-semibold text-card-foreground" textWrap="true" />
            </StackLayout>
        </StackLayout>
    </StackLayout>
</template>

<script setup lang="ts">
// --- Imports ---
import { computed, type ComputedRef } from 'vue';
import type { Client } from '../types/schema/client';
import { Format } from '../utils/format';


// --- Component logic ---
const props = defineProps<{
    client: Client | null;
}>();

function displayOrDash(value: string | null | undefined): string {
    const t: string = (value ?? '').trim();
    return t !== '' ? t : '—';
}

const buyerNameLabel: ComputedRef<string> = computed(() => displayOrDash(props.client?.buyer_name));

const buyerContactLabel: ComputedRef<string> = computed(() => displayOrDash(props.client?.buyer_contact));
</script>
