<template>
    <Page actionBarHidden="true">
        <GridLayout rows="auto, *, auto" class="bg-background">

            <HeaderComponent row="0" :title="headerTitle" />

            <!-- Content -->
            <ScrollView row="1">
                <StackLayout>
                    <!-- Hero: Values (dark) -->
                    <StackLayout class="bg-primary p-4 py-6">
                        <GridLayout rows="auto" columns="*, *">
                            <StackLayout col="0" class="mr-4" horizontalAlignment="center" verticalAlignment="center">
                                <Label :text="$t('pages.orderShow.orderValue')" class="text-xs text-primary-foreground opacity-80 mb-1" />
                                <Label :text="displayOrderValue" class="text-2xl font-bold text-success" />
                            </StackLayout>
                            <StackLayout col="1" class="ml-4" horizontalAlignment="center" verticalAlignment="center">
                                <Label :text="$t('pages.orderShow.totalItems')" class="text-xs text-primary-foreground opacity-80 mb-1" />
                                <Label :text="displayTotalItems" class="text-2xl font-bold text-primary-foreground" />
                            </StackLayout>
                        </GridLayout>
                    </StackLayout>

                    <!-- Client -->
                    <StackLayout class="px-4 pt-4 pb-8">
                        <StackLayout class="card mb-4" androidElevation="2">
                            <GridLayout columns="auto, *, auto" class="mb-3">
                                <Label col="0" :text="Icons.lucide('circle-user')" class="lucide text-muted-foreground mr-3" verticalAlignment="center" />
                                <Label col="1" :text="$t('pages.orderShow.client')" class="text-sm font-medium text-muted-foreground" verticalAlignment="center" />
                                <Button col="2" :text="Icons.lucide('eye')" class="lucide btn-icon-sm bg-secondary text-secondary-foreground" @tap="goToClientShow" />
                            </GridLayout>
                            <Label :text="clientFantasyName || '—'" class="text-lg font-semibold text-card-foreground mb-2" textWrap="true" />
                            <Label :text="buyerName ? ($t('pages.orderShow.buyer') + ': ' + buyerName) : '—'" class="text-sm text-muted-foreground" textWrap="true" />
                        </StackLayout>

                        <!-- Payment -->
                        <StackLayout class="card mb-4" androidElevation="2">
                            <GridLayout columns="auto, *, auto" class="mb-3">
                                <Label col="0" :text="Icons.lucide('credit-card')" class="lucide text-muted-foreground mr-3" verticalAlignment="center" />
                                <Label col="1" :text="$t('pages.orderShow.paymentMethod')" class="text-sm font-medium text-muted-foreground" verticalAlignment="center" />
                                <Button col="2" :text="Icons.lucide('pencil')" class="lucide btn-icon-sm bg-secondary text-secondary-foreground" @tap="goToPayment" />
                            </GridLayout>
                            <Label :text="paymentMethodName || '—'" class="text-lg font-semibold text-card-foreground" textWrap="true" />
                        </StackLayout>

                        <!-- Observation -->
                        <StackLayout class="card" androidElevation="2">
                            <GridLayout columns="auto, *" class="mb-3">
                                <Label col="0" :text="Icons.lucide('clipboard-list')" class="lucide text-muted-foreground mr-3" verticalAlignment="center" />
                                <Label col="1" :text="$t('pages.orderShow.observation')" class="text-sm font-medium text-muted-foreground" verticalAlignment="center" />
                            </GridLayout>
                            <TextView
                                v-model="observation"
                                :hint="$t('pages.orderShow.observationHint')"
                                class="input-field"
                                height="100"
                                :editable="observationEditable"
                            />
                        </StackLayout>
                    </StackLayout>
                </StackLayout>
            </ScrollView>

            <!-- Footer -->
            <StackLayout row="2" class="footer-bar">
                <GridLayout rows="auto" columns="*, *" class="mb-3" verticalAlignment="center">
                    <Label
                        col="0"
                        :text="orderStatus === 'pending' ? $t('pages.orderShow.statusOpen') : orderStatus === 'completed' ? $t('pages.orderShow.statusCompleted') : $t('pages.orderList.statusCanceled')"
                        :class="(orderStatus === 'pending' ? 'badge-success' : orderStatus === 'completed' ? 'badge-secondary' : 'badge-destructive') + ' mr-2'"
                        verticalAlignment="center"
                        horizontalAlignment="center"
                    />
                    <GridLayout col="1" columns="auto, *" class="ml-2" verticalAlignment="center" horizontalAlignment="center">
                        <Label col="0" :text="synced ? Icons.lucide('circle-check') : Icons.lucide('clock')" :class="(synced ? 'lucide text-success' : 'lucide text-warning') + ' mr-2'" verticalAlignment="center" />
                        <Label col="1" :text="synced ? $t('pages.orderList.synced') : $t('pages.orderList.notSynced')" class="text-sm" :class="synced ? 'text-success' : 'text-warning'" verticalAlignment="center" />
                    </GridLayout>
                </GridLayout>
                <GridLayout rows="auto" columns="*, *" columnSpacing="12">
                    <Button
                        row="0"
                        col="0"
                        horizontalAlignment="stretch"
                        :text="orderStatus === 'pending' ? $t('pages.orderShow.finish') : $t('pages.orderShow.reopen')"
                        :class="primaryFooterButtonClass"
                        :isEnabled="primaryFooterButtonEnabled"
                        @tap="onPrimaryFooterTap"
                    />
                    <Button
                        row="0"
                        col="1"
                        horizontalAlignment="stretch"
                        :text="Icons.lucide('file-text')"
                        class="lucide btn-secondary"
                        @tap="onPrint"
                    />
                </GridLayout>
            </StackLayout>
        </GridLayout>
    </Page>
</template>

<script setup lang="ts">
// --- Imports ---
import { ref, computed, watch, type ComputedRef, type Ref } from 'vue';
import { useTranslation } from '../../../composables/useTranslation';
import { Format } from '../../../utils/format';
import { Icons } from '../../../utils/icons';
import { useNavigation } from '../../../composables/useNavigation';
import { useCurrentOrder } from '../../../composables/repository/useCurrentOrder';
import { useCurrentEvent } from '../../../composables/repository/useCurrentEvent';
import { OrdersRepository } from '../../../db/repositories/orders.repo';
import { PaymentMethodsComposable } from '../../../composables/payment-methods-composable';
import { showToast } from '../../../composables/toast-state';
import { Haptics } from '../../../utils/haptics';
import HeaderComponent from '../../../components/HeaderComponent.vue';
import OrderClientShowPage from './OrderClientShowPage.vue';
import OrderPaymentPage from './OrderPaymentPage.vue';
import type { Order, OrderStatus } from '../../../types/schema/order';
import OrderListPage from './OrderListPage.vue';
import { pdfService } from '../../../services/pdf/pdf-service';


// --- Component logic ---
const { navigateTo } = useNavigation();
const { t }: { t: (key: string) => string } = useTranslation();

const observation: Ref<string> = ref('');

const currentOrderRef = useCurrentOrder.getOrder();

const headerTitle: ComputedRef<string> = computed(() => {
    const id = currentOrderRef.value?.id;
    if (typeof id === 'number') return '#' + String(id);
    return '#—';
});

const orderItemsCount: ComputedRef<number> = computed(() => currentOrderRef.value?.order_items?.length ?? 0);

const orderTotalValue: ComputedRef<number> = computed(() => {
    const items = currentOrderRef.value?.order_items ?? [];
    return items.reduce((sum, line) => sum + line.price * line.qty, 0);
});

const displayOrderValue: ComputedRef<string> = computed(() => Format.formatCurrencyBR(orderTotalValue.value));

const displayTotalItems: ComputedRef<string> = computed(() => {
    const n = orderItemsCount.value;
    // Mantém o texto atual simples; se quiser i18n depois, ajustamos.
    return `${n} itens`;
});

const orderStatus: ComputedRef<OrderStatus> = computed(() => {
    const raw = currentOrderRef.value?.status;
    if (raw === 'pending' || raw === 'completed' || raw === 'cancelled') {
        return raw;
    }
    return 'pending';
});

const observationEditable: ComputedRef<boolean> = computed(() => orderStatus.value === 'pending');

const synced: ComputedRef<boolean> = computed(() => currentOrderRef.value?.is_sync ?? false);

const paymentMethodName: ComputedRef<string> = computed(() => {
    const paymentMethodId = currentOrderRef.value?.payment_method_id ?? null;
    if (!paymentMethodId) return '';
    const methods = PaymentMethodsComposable.getList().value;
    return methods.find((m) => m.id === paymentMethodId)?.name ?? '';
});

const canFinalizeOrder: ComputedRef<boolean> = computed(() => currentOrderRef.value?.payment_method_id != null);

const primaryFooterButtonClass: ComputedRef<string> = computed(() => {
    if (orderStatus.value === 'pending') {
        return canFinalizeOrder.value ? 'btn-primary' : 'btn-primary opacity-50';
    }
    return 'btn-primary';
});

const primaryFooterButtonEnabled: ComputedRef<boolean> = computed(() =>
    orderStatus.value === 'pending' ? canFinalizeOrder.value : true,
);

const clientFantasyName: ComputedRef<string> = computed(() => {
    const c = currentOrderRef.value?.client;
    return c?.fantasy_name?.trim() || c?.corporate_name?.trim() || '';
});

const buyerName: ComputedRef<string> = computed(() => {
    const raw = currentOrderRef.value?.buyer_name;
    return typeof raw === 'string' ? raw.trim() : '';
});

watch(
    () => currentOrderRef.value?.notes,
    (notes) => {
        // Mantém o TextView controlado localmente, mas inicializa com o valor do pedido.
        observation.value = notes ?? '';
    },
    { immediate: true },
);


function goToPayment(): void {
    navigateTo(OrderPaymentPage);
}

function goToClientShow(): void {
    navigateTo(OrderClientShowPage);
}

async function onPrint(): Promise<void> {
    console.log('[OrderShowPage] Print tapped');
    try {
        console.log('[OrderShowPage] calling pdfService.generateHelloWorld...');
        const filePath = await pdfService.generateSampleOrder();
        console.log('[OrderShowPage] PDF saved:', filePath);
    } catch (err: unknown) {
        console.log('[OrderShowPage] PDF error:', err);
        console.error(err);
    } finally {
        console.log('[OrderShowPage] onPrint finished');
    }
}

function onPrimaryFooterTap(): void {
    if (orderStatus.value === 'pending') {
        void onFinish();
        return;
    }
    void onReopen();
}

async function onFinish(): Promise<void> {
    const order: Order = currentOrderRef.value as Order;
    const id = order.id as number;

    const storedNotes: string = (order.notes ?? '').trim();
    const draftNotes: string = observation.value.trim();
    
    if (storedNotes !== draftNotes) {
        await OrdersRepository.updateNotes(id, draftNotes === '' ? null : draftNotes);
    }

    await OrdersRepository.updateStatus(id, 'completed');
    await useCurrentOrder.refresh();
    navigateTo(OrderListPage, { clearHistory: true });
}

async function onReopen(): Promise<void> {
    try {
        const order: Order = currentOrderRef.value as Order;
        const id = order.id as number;
        await OrdersRepository.updateStatus(id, 'pending');
        await useCurrentOrder.refresh();
        Haptics.vibrateSuccess();
        showToast({ message: t('pages.orderShow.reopenSuccess'), variant: 'success' });
    } catch (err: unknown) {
        console.error(err);
        showToast({ message: t('pages.orderShow.reopenError'), variant: 'error' });
    }
}
</script>
