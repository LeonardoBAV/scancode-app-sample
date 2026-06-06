<template>
    <Page actionBarHidden="true" @navigatedTo="onNavigatedTo">
        <GridLayout rows="auto, auto, *, auto" class="bg-background">

            <HeaderComponent row="0" :title="$t('pages.orderList.title')" />

            <!-- Search -->
            <StackLayout row="1" class="px-4 pt-4 pb-2">
                <GridLayout columns="auto, *" class="input-search">
                    <Label col="0" :text="Icons.lucide('search')" class="lucide text-muted-foreground mr-3" verticalAlignment="center" />
                    <TextField col="1" v-model="searchQuery" :hint="$t('common.search')" class="text-base text-foreground p-0" placeholderColor="#a1a1aa" />
                </GridLayout>
            </StackLayout>

            <!-- Loading -->
            <StackLayout v-if="loading" row="2" class="p-8" verticalAlignment="center" horizontalAlignment="center">
                <Label :text="$t('common.loading')" class="text-base text-muted-foreground text-center" textWrap="true" />
            </StackLayout>

            <!-- No event -->
            <StackLayout v-else-if="!currentEvent" row="2" class="p-8" verticalAlignment="center" horizontalAlignment="center">
                <Label :text="$t('pages.eventHome.noEvent')" class="text-base text-muted-foreground text-center mb-4" textWrap="true" />
                <Button :text="$t('pages.eventHome.backToEvents')" class="btn-primary" @tap="goToEvents" />
            </StackLayout>

            <!-- List or Empty -->
            <ListView v-else-if="filteredOrders.length > 0" row="2" :items="filteredOrders" separatorColor="transparent">
                <template #default="{ item }">
                    <StackLayout class="px-4 pt-2 pb-3" @tap="onOrderTap(item)">
                        <GridLayout rows="auto, auto, auto, auto" columns="auto, *, auto" class="p-4 bg-card border border-border rounded-lg">
                            <Label row="0" col="0" rowSpan="4" :text="Icons.lucide('receipt')" class="lucide text-muted-foreground mr-4" verticalAlignment="top" />
                            <Label row="0" col="1" :text="item.clientCompanyName" class="text-base font-semibold text-card-foreground" textWrap="true" />
                            <Label row="0" col="2" :text="item.statusLabel" :class="item.statusBadgeClass" verticalAlignment="top" horizontalAlignment="right" />
                            <Label row="1" col="1" colSpan="2" :text="String(item.id)" class="text-xs text-muted-foreground" />
                            <Label row="2" col="1" colSpan="2" :text="item.itemCount + ' ' + $t('pages.orderList.items') + ' · ' + Format.formatCurrencyBR(item.totalValue)" class="text-sm text-muted-foreground mt-1" />
                            <GridLayout row="3" col="1" colSpan="2" columns="auto, *" class="mt-2">
                                <Label col="0" :text="item.synced ? Icons.lucide('circle-check') : Icons.lucide('clock')" :class="(item.synced ? 'lucide text-success' : 'lucide text-warning') + ' mr-2'" verticalAlignment="center" />
                                <Label col="1" :text="item.synced ? $t('pages.orderList.synced') : $t('pages.orderList.notSynced')" class="text-xs" :class="item.synced ? 'text-success' : 'text-warning'" verticalAlignment="center" />
                            </GridLayout>
                        </GridLayout>
                    </StackLayout>
                </template>
            </ListView>

            <StackLayout v-else row="2" class="p-8" verticalAlignment="center" horizontalAlignment="center">
                <Label :text="Icons.lucide('receipt')" class="lucide text-muted-foreground text-4xl text-center mb-4" />
                <Label :text="$t('pages.orderList.empty')" class="text-lg font-semibold text-foreground text-center mb-2" />
                <Label :text="$t('pages.orderList.emptyHint')" class="text-sm text-muted-foreground text-center" textWrap="true" />
            </StackLayout>

            <!-- Footer: sync | novo pedido -->
            <GridLayout
                v-if="currentEvent && !loading"
                row="3"
                rows="auto"
                columns="*, *"
                columnSpacing="12"
                class="footer-bar"
            >
            <Button
                    row="0"
                    col="0"
                    horizontalAlignment="stretch"
                    :text="Icons.lucide('plus')"
                    class="lucide btn-primary"
                    @tap="onAddNewOrder"
                />
                <Button
                    row="0"
                    col="1"
                    horizontalAlignment="stretch"
                    :text="Icons.lucide('refresh-cw')"
                    class="lucide btn-secondary"
                    :isEnabled="!syncingOrders"
                    @tap="onSyncOrders"
                />
            </GridLayout>

        </GridLayout>
    </Page>
</template>

<script setup lang="ts">
import { computed, ref, type DeepReadonly } from 'vue';
import { useTranslation } from '../../../composables/useTranslation';
import { useNavigation } from '../../../composables/useNavigation';
import { useCurrentEvent } from '../../../composables/repository/useCurrentEvent';
import { useSelectedOrder } from '../../../composables/repository/SelectedOrderComposable';
import { syncService } from '../../../sync/sync-service';
import type { Order as SchemaOrder, OrderStatus } from '../../../types/schema/order';
import { Icons } from '../../../utils/icons';
import { Format } from '../../../utils/format';
import HeaderComponent from '../../../components/HeaderComponent.vue';
import EventsPage from '../../EventsPage.vue';
import OrderSelectClientPage from './OrderSelectClientPage.vue';
import OrderShowPage from './OrderShowPage.vue';

interface OrderListRow {
    id: number;
    clientCompanyName: string;
    statusLabel: string;
    statusBadgeClass: string;
    itemCount: number;
    totalValue: number;
    synced: boolean;
}

const { t } = useTranslation();
const { navigateTo } = useNavigation();

const currentEventRef = useCurrentEvent.getEvent();
const loadingRef = useCurrentEvent.getIsLoading();

const currentEvent = computed(() => currentEventRef.value);
const loading = computed(() => loadingRef.value);

const searchQuery = ref('');
const syncingOrders = ref(false);

function clientDisplayName(order: DeepReadonly<SchemaOrder>): string {
    const c = order.client;
    const fantasy = c?.fantasy_name?.trim();
    if (fantasy) {
        return fantasy;
    }
    const corporate = c?.corporate_name?.trim();
    if (corporate) {
        return corporate;
    }
    return t('pages.orderList.unknownClient');
}

function orderStatusPresentation(status: OrderStatus): { label: string; badgeClass: string } {
    switch (status) {
        case 'pending':
            return { label: t('pages.orderList.statusOpen'), badgeClass: 'badge-success' };
        case 'completed':
            return { label: t('pages.orderList.statusClosed'), badgeClass: 'badge-secondary' };
        case 'cancelled':
            return { label: t('pages.orderList.statusCanceled'), badgeClass: 'badge-destructive' };
    }
}

function toListRow(order: DeepReadonly<SchemaOrder>): OrderListRow {
    const items = order.order_items ?? [];
    const itemCount = items.length;
    const totalValue = items.reduce((sum, line) => sum + line.price * line.qty, 0);
    const pres = orderStatusPresentation(order.status);
    return {
        id: order.id as number,
        clientCompanyName: clientDisplayName(order),
        statusLabel: pres.label,
        statusBadgeClass: pres.badgeClass,
        itemCount,
        totalValue,
        synced: order.is_sync,
    };
}

const listOrders = computed((): OrderListRow[] => {
    const orders = currentEvent.value?.orders;
    if (!orders?.length) {
        return [];
    }
    return orders.map(toListRow);
});

const filteredOrders = computed(() => {
    const term = searchQuery.value.trim().toLowerCase();
    if (!term) {
        return listOrders.value;
    }
    return listOrders.value.filter(
        (o: OrderListRow) =>
            o.clientCompanyName.toLowerCase().includes(term) ||
            String(o.id).includes(term),
    );
});

function onNavigatedTo(): void {
    useSelectedOrder.clearOrder();
}

function goToEvents(): void {
    navigateTo(EventsPage, { frame: 'root-frame', clearHistory: true });
}

async function onOrderTap(order: OrderListRow): Promise<void> {
    await useSelectedOrder.setOrder(order.id);
    navigateTo(OrderShowPage);
}

function onAddNewOrder(): void {
    navigateTo(OrderSelectClientPage, {
        props: { originPage: 'OrderListPage' as const },
        backstackVisible: false,
    });
}

async function onSyncOrders(): Promise<void> {
    const eventId = currentEvent.value?.id;
    if (typeof eventId !== 'number') {
        return;
    }
    syncingOrders.value = true;
    try {
        await syncService.updateOrders();
        await useCurrentEvent.setEvent(eventId);
    } catch (err: unknown) {
        console.error('[OrderListPage] onSyncOrders failed:', err);
    } finally {
        syncingOrders.value = false;
    }
}
</script>
