<template>
    <Page actionBarHidden="true">
        <GridLayout rows="auto, auto, *, auto" class="bg-background">

            <HeaderComponent row="0" :title="$t('pages.orderList.title')" />

            <!-- Search -->
            <StackLayout row="1" class="px-4 pt-4 pb-2">
                <GridLayout columns="auto, *" class="input-search">
                    <Label col="0" :text="lucide('search')" class="lucide text-muted-foreground mr-3" verticalAlignment="center" />
                    <TextField col="1" v-model="searchQuery" :hint="$t('common.search')" class="text-base text-foreground p-0" placeholderColor="#a1a1aa" />
                </GridLayout>
            </StackLayout>

            <!-- List or Empty -->
            <ListView v-if="filteredOrders.length > 0" row="2" :items="filteredOrders" separatorColor="transparent">
                <template #default="{ item }">
                    <StackLayout class="px-4 pt-2 pb-3" @tap="onOrderTap(item)">
                        <GridLayout rows="auto, auto, auto, auto" columns="auto, *, auto" class="p-4 bg-card border border-border rounded-lg">
                            <Label row="0" col="0" rowSpan="4" :text="lucide('receipt')" class="lucide text-muted-foreground mr-4" verticalAlignment="top" />
                            <Label row="0" col="1" :text="item.clientCompanyName" class="text-base font-semibold text-card-foreground" textWrap="true" />
                            <Label row="0" col="2" :text="statusLabel(item.status)" :class="statusBadgeClass(item.status)" verticalAlignment="top" horizontalAlignment="right" />
                            <Label row="1" col="1" colSpan="2" :text="item.id" class="text-xs text-muted-foreground" />
                            <Label row="2" col="1" colSpan="2" :text="item.itemCount + ' ' + $t('pages.orderList.items') + ' · ' + formatCurrencyBR(item.totalValue, $t('common.free'))" class="text-sm text-muted-foreground mt-1" />
                            <GridLayout row="3" col="1" colSpan="2" columns="auto, *" class="mt-2">
                                <Label col="0" :text="item.synced ? lucide('circle-check') : lucide('clock')" :class="(item.synced ? 'lucide text-success' : 'lucide text-warning') + ' mr-2'" verticalAlignment="center" />
                                <Label col="1" :text="item.synced ? $t('pages.orderList.synced') : $t('pages.orderList.notSynced')" class="text-xs" :class="item.synced ? 'text-success' : 'text-warning'" verticalAlignment="center" />
                            </GridLayout>
                        </GridLayout>
                    </StackLayout>
                </template>
            </ListView>

            <StackLayout v-else row="2" class="p-8" verticalAlignment="center" horizontalAlignment="center">
                <Label :text="lucide('receipt')" class="lucide text-muted-foreground text-4xl text-center mb-4" />
                <Label :text="$t('pages.orderList.empty')" class="text-lg font-semibold text-foreground text-center mb-2" />
                <Label :text="$t('pages.orderList.emptyHint')" class="text-sm text-muted-foreground text-center" textWrap="true" />
            </StackLayout>

            <!-- Footer: add order -->
            <GridLayout row="3" rows="auto" class="footer-bar">
                <Button :text="$t('pages.orderList.addOrder')" class="btn-primary" @tap="onAddNewOrder" />
            </GridLayout>

        </GridLayout>
    </Page>
</template>

<script setup lang="ts">
import { ref, computed, getCurrentInstance } from 'vue';
import { useTranslation } from '../../../composables/useTranslation';
import type { Order, OrderStatus } from '../../../types/order';
import { lucide } from '../../../utils/icons';
import { formatCurrencyBR } from '../../../utils/format';
import HeaderComponent from '../../../components/HeaderComponent.vue';
import OrderSelectClientPage from './OrderSelectClientPage.vue';
import OrderShowPage from './OrderShowPage.vue';

const { t } = useTranslation();

const searchQuery = ref('');

const orders = ref<Order[]>([
    { id: 'ORD-001', clientCompanyName: 'Empresa Alpha Ltda', status: 'Open', itemCount: 5, totalValue: 1250, synced: false },
    { id: 'ORD-002', clientCompanyName: 'Beta Comércio S.A.', status: 'Closed', itemCount: 12, totalValue: 3400, synced: true },
    { id: 'ORD-003', clientCompanyName: 'Gamma Serviços ME', status: 'Open', itemCount: 3, totalValue: 480, synced: false },
    { id: 'ORD-004', clientCompanyName: 'Delta Indústria Ltda', status: 'Canceled', itemCount: 0, totalValue: 0, synced: true },
    { id: 'ORD-005', clientCompanyName: 'Epsilon Solutions', status: 'Closed', itemCount: 8, totalValue: 2100, synced: true },
    { id: 'ORD-006', clientCompanyName: 'Zeta Distribuidora', status: 'Open', itemCount: 15, totalValue: 5200, synced: false },
    { id: 'ORD-007', clientCompanyName: 'Eta Logística S.A.', status: 'Closed', itemCount: 4, totalValue: 890, synced: true },
    { id: 'ORD-008', clientCompanyName: 'Theta Tech Ltda', status: 'Open', itemCount: 7, totalValue: 1650, synced: false },
    { id: 'ORD-009', clientCompanyName: 'Iota Alimentos ME', status: 'Closed', itemCount: 22, totalValue: 4100, synced: true },
    { id: 'ORD-010', clientCompanyName: 'Kappa Construção', status: 'Open', itemCount: 6, totalValue: 2800, synced: false },
    { id: 'ORD-011', clientCompanyName: 'Lambda Consultoria', status: 'Closed', itemCount: 2, totalValue: 650, synced: true },
]);

const filteredOrders = computed(() => {
    const term = searchQuery.value.trim().toLowerCase();
    if (!term) return orders.value;
    return orders.value.filter(
        (o: Order) =>
            o.clientCompanyName.toLowerCase().includes(term) ||
            o.id.toLowerCase().includes(term),
    );
});

const instance = getCurrentInstance();
const navigateTo = instance?.appContext.config.globalProperties.$navigateTo as (
    target: unknown,
    options?: Record<string, unknown>,
) => void;

function statusLabel(status: OrderStatus): string {
    switch (status) {
        case 'Open': return t('pages.orderList.statusOpen');
        case 'Closed': return t('pages.orderList.statusClosed');
        case 'Canceled': return t('pages.orderList.statusCanceled');
        default: return status;
    }
}

function statusBadgeClass(status: OrderStatus): string {
    switch (status) {
        case 'Open': return 'badge-success';
        case 'Closed': return 'badge-secondary';
        case 'Canceled': return 'badge-destructive';
        default: return 'badge-outline';
    }
}

function onOrderTap(order: Order): void {
    navigateTo?.(OrderSelectClientPage, {
        props: { targetPage: 'OrderShowPage' as const, orderId: order.id },
    });
}

function onAddNewOrder(): void {
    navigateTo?.(OrderShowPage);
}
</script>
