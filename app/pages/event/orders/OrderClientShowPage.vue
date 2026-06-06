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
                            <TextField
                                v-model="buyerName"
                                :hint="$t('pages.orderClientShow.buyerName')"
                                class="input-field mb-3"
                                placeholderColor="#71717a"
                                :editable="isOrderEditable"
                            />
                            <Label :text="$t('pages.orderClientShow.buyerContact')" class="text-xs text-muted-foreground mb-1" />
                            <TextField
                                v-model="buyerPhone"
                                :hint="$t('pages.orderClientShow.buyerContact')"
                                class="input-field mb-3"
                                placeholderColor="#71717a"
                                :editable="isOrderEditable"
                            />
                        </StackLayout>
                    </StackLayout>
                </StackLayout>
            </ScrollView>

            <!-- Footer: Alterar cliente (flutuado) -->
            <StackLayout row="2" class="footer-bar">
                <GridLayout rows="auto" columns="*, *" columnSpacing="12">
                    <Button
                        row="0"
                        col="0"
                        :text="$t('common.save')"
                        :class="isDirty && isOrderEditable ? 'btn-secondary' : 'btn-secondary opacity-50'"
                        :isEnabled="isDirty && isOrderEditable"
                        @tap="onSaveBuyerFields"
                    />
                    <Button
                        row="0"
                        col="1"
                        :text="$t('pages.orderClientShow.changeClient')"
                        class="btn-primary"
                        :isEnabled="isOrderEditable"
                        @tap="goToClientList"
                    />
                </GridLayout>
            </StackLayout>
        </GridLayout>
    </Page>
</template>

<script setup lang="ts">
// --- Imports ---
import { Format } from '../../../utils/format';
import { computed, ref, watch, type ComputedRef, type Ref } from 'vue';
import { showToast } from '../../../composables/toast-state';
import { useTranslation } from '../../../composables/useTranslation';
import { useNavigation } from '../../../composables/useNavigation';
import { useSelectedOrder } from '../../../composables/repository/useSelectedOrder';
import type { OrderStatus } from '../../../types/schema/order';
import { OrdersRepository } from '../../../db/repositories/orders.repo';
import HeaderComponent from '../../../components/HeaderComponent.vue';
import OrderSelectClientPage from './OrderSelectClientPage.vue';
import OrderShowPage from './OrderShowPage.vue';


// --- Component logic ---
const { navigateTo, navigateBack } = useNavigation();
const { t } = useTranslation();

const currentOrderRef = useSelectedOrder.getOrder();
const client = computed(() => currentOrderRef.value?.client ?? null);

const orderStatus = computed((): OrderStatus => {
    const raw = currentOrderRef.value?.status;
    if (raw === 'pending' || raw === 'completed' || raw === 'cancelled') {
        return raw;
    }
    return 'pending';
});

const isOrderEditable = computed(() => orderStatus.value === 'pending');

const buyerName: Ref<string> = ref('');
const buyerPhone: Ref<string> = ref('');

const originalBuyerName: Ref<string> = ref('');
const originalBuyerPhone: Ref<string> = ref('');

const isDirty: ComputedRef<boolean> = computed(() => {
    return buyerName.value.trim() !== originalBuyerName.value || buyerPhone.value.trim() !== originalBuyerPhone.value;
});

watch(
    () => currentOrderRef.value,
    (order) => {
        const nextBuyerName: string = (order?.buyer_name ?? '').trim();
        const nextBuyerPhone: string = (order?.buyer_phone ?? '').trim();

        buyerName.value = nextBuyerName;
        buyerPhone.value = nextBuyerPhone;
        originalBuyerName.value = nextBuyerName;
        originalBuyerPhone.value = nextBuyerPhone;
    },
    { immediate: true },
);

async function onSaveBuyerFields(): Promise<void> {
    if (!isOrderEditable.value) {
        return;
    }
    const nextBuyerName: string = buyerName.value.trim();
    const nextBuyerPhone: string = buyerPhone.value.trim();

    await OrdersRepository.updateBuyerFields(
        currentOrderRef.value?.id as number,
        nextBuyerName === '' ? null : nextBuyerName,
        nextBuyerPhone === '' ? null : nextBuyerPhone,
    );

    await useSelectedOrder.refresh();
    showToast({ message: t('pages.orderClientShow.saveBuyerSuccess'), variant: 'success' });
    navigateBack();
}


function goToClientList(): void {
    if (!isOrderEditable.value) {
        return;
    }
    navigateTo(OrderSelectClientPage, {
        props: { originPage: 'OrderClientShowPage' },
        backstackVisible: false,
    });
}
</script>
