<template>
    <Page actionBarHidden="true">
        <GridLayout rows="auto, *, auto" class="bg-background">
            <HeaderComponent row="0" :title="client?.fantasy_name || $t('pages.orderClientShow.title')" />

            <ScrollView row="1">
                <StackLayout class="p-4 pb-4">
                    <!-- Client + Buyer card -->
                    <StackLayout class="card p-0 mb-4" androidElevation="2">
                        <!-- Client details -->
                        <StackLayout class="p-4">
                            <Label :text="$t('pages.orderClientShow.fantasyName')" class="text-xs text-muted-foreground mb-1" />
                            <Label :text="client?.fantasy_name || '—'" class="text-base font-semibold text-card-foreground" textWrap="true" />
                        </StackLayout>
                        <StackLayout class="bg-border mx-4" style="height: 1" />
                        <StackLayout class="p-4">
                            <Label :text="$t('pages.orderClientShow.corporateName')" class="text-xs text-muted-foreground mb-1" />
                            <Label :text="client?.corporate_name || '—'" class="text-base font-semibold text-card-foreground" textWrap="true" />
                        </StackLayout>
                        <StackLayout class="bg-border mx-4" style="height: 1" />
                        <StackLayout class="p-4">
                            <Label :text="$t('pages.orderClientShow.cpfCnpj')" class="text-xs text-muted-foreground mb-1" />
                            <Label :text="client?.cpf_cnpj ? Format.formatCPFCNPJ(client.cpf_cnpj) : '—'" class="text-base font-semibold text-card-foreground" textWrap="true" />
                        </StackLayout>
                        <StackLayout class="bg-border mx-4" style="height: 1" />
                        <StackLayout class="p-4">
                            <Label :text="$t('pages.orderClientShow.email')" class="text-xs text-muted-foreground mb-1" />
                            <Label :text="client?.email || '—'" class="text-base font-semibold text-card-foreground" textWrap="true" />
                        </StackLayout>
                        <StackLayout class="bg-border mx-4" style="height: 1" />
                        <StackLayout class="p-4">
                            <Label :text="$t('pages.orderClientShow.phone')" class="text-xs text-muted-foreground mb-1" />
                            <Label :text="client?.phone || '—'" class="text-base font-semibold text-card-foreground" textWrap="true" />
                        </StackLayout>
                        <StackLayout class="bg-border mx-4" style="height: 1" />
                        <!-- Buyer section -->
                        <StackLayout class="p-4">
                            <Label :text="$t('pages.orderClientShow.buyerName')" class="text-xs text-muted-foreground mb-1" />
                            <TextField v-model="buyerName" :hint="$t('pages.orderClientShow.buyerName')" class="input-field mb-3" placeholderColor="#71717a" />
                            <Label :text="$t('pages.orderClientShow.buyerContact')" class="text-xs text-muted-foreground mb-1" />
                            <TextField v-model="buyerContact" :hint="$t('pages.orderClientShow.buyerContact')" class="input-field" placeholderColor="#71717a" />
                        </StackLayout>
                    </StackLayout>
                </StackLayout>
            </ScrollView>

            <!-- Footer: Alterar cliente (flutuado) -->
            <StackLayout row="2" class="footer-bar">
                <Button :text="$t('pages.orderClientShow.changeClient')" class="btn-primary" @tap="goToClientList" />
            </StackLayout>
        </GridLayout>
    </Page>
</template>

<script setup lang="ts">
// --- Imports ---
import { Format } from '../../../utils/format';
import { computed, ref, type Ref } from 'vue';
import type { ComputedRef } from 'vue';
import { useNavigation } from '../../../composables/useNavigation';
import { useCurrentOrder } from '../../../composables/repository/useCurrentOrder';
import HeaderComponent from '../../../components/HeaderComponent.vue';
import OrderSelectClientPage from './OrderSelectClientPage.vue';


// --- Component logic ---
const { navigateTo } = useNavigation();

const currentOrderRef = useCurrentOrder.getOrder();
const client = computed(() => currentOrderRef.value?.client ?? null);

const buyerName: Ref<string> = ref('N/A');
const buyerContact: Ref<string> = ref('N/A');


function goToClientList(): void {
    navigateTo(OrderSelectClientPage, {
        props: { originPage: 'OrderClientShowPage' },
        backstackVisible: false,
    });
}
</script>
