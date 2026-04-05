<template>
    <Page actionBarHidden="true">
        <GridLayout rows="auto, *" class="bg-background">
            <HeaderComponent row="0" :title="client?.fantasy_name ?? $t('pages.clientShow.title')" :showAvatar="false" />

            <ScrollView row="1">
                <StackLayout class="p-4 pb-8">
                    <StackLayout class="card p-0" androidElevation="2">
                        <StackLayout class="p-4">
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
                            <Label :text="formatCPFCNPJ(client?.cpf_cnpj ?? '')" class="text-base font-semibold text-card-foreground" textWrap="true" />
                        </StackLayout>
                        <StackLayout class="bg-border mx-4" style="height: 1" />
                        <StackLayout class="p-4">
                            <Label :text="$t('pages.orderClientShow.buyerName')" class="text-xs text-muted-foreground mb-1" />
                            <Label :text="client?.corporate_name ?? '—'" class="text-base font-semibold text-card-foreground" textWrap="true" />
                        </StackLayout>
                        <StackLayout class="bg-border mx-4" style="height: 1" />
                        <StackLayout class="p-4">
                            <Label :text="$t('pages.orderClientShow.buyerContact')" class="text-xs text-muted-foreground mb-1" />
                            <Label :text="contactLabel" class="text-base font-semibold text-card-foreground" textWrap="true" />
                        </StackLayout>
                    </StackLayout>
                </StackLayout>
            </ScrollView>
        </GridLayout>
    </Page>
</template>

<script setup lang="ts">
// --- Imports ---
import { computed } from 'vue';
import type { Client } from '../../types/schema/client';
import { formatCPFCNPJ } from '../../utils/format';
import HeaderComponent from '../../components/HeaderComponent.vue';


// --- Component logic ---
const props = defineProps<{
    client: Client | null;
}>();

const contactLabel = computed(() => {
    const c = props.client;
    if (!c) return '—';
    const parts: string[] = [];
    if (c.email) parts.push(c.email);
    if (c.phone) parts.push(c.phone);
    return parts.length > 0 ? parts.join(' · ') : '—';
});
</script>
