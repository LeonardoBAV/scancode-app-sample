<template>
    <Page actionBarHidden="true">
        <GridLayout rows="auto, *" class="bg-background">
            <HeaderComponent row="0" :title="headerTitle" />
            <StackLayout v-if="loading" row="1" class="p-8" verticalAlignment="center" horizontalAlignment="center">
                <Label :text="$t('common.loading')" class="text-base text-muted-foreground text-center" textWrap="true" />
            </StackLayout>
            <StackLayout v-else-if="!eventDisplay" row="1" class="p-8" verticalAlignment="center" horizontalAlignment="center">
                <Label :text="$t('pages.eventHome.noEvent')" class="text-base text-muted-foreground text-center mb-4" textWrap="true" />
                <Button :text="$t('pages.eventHome.backToEvents')" class="btn-primary" @tap="goToEvents" />
            </StackLayout>
            <ScrollView v-else row="1">
                <StackLayout class="p-4 pb-8">


                    <!-- Summary Card -->
                    <StackLayout class="card p-0">

                        <!-- Status + Date -->
                        <GridLayout columns="*, auto" class="p-4">
                            <StackLayout col="0">
                                <Label :text="$t('pages.eventHome.status')" class="text-xs text-muted-foreground mb-1" />
                                <Label :text="statusLabel(eventDisplay.status)" :class="statusBadgeClass(eventDisplay.status)" horizontalAlignment="left" />
                            </StackLayout>
                            <StackLayout col="1" horizontalAlignment="right">
                                <Label :text="$t('pages.eventHome.date')" class="text-xs text-muted-foreground mb-1 text-right" />
                                <Label :text="eventDisplay.startDate + ' — ' + eventDisplay.endDate" class="text-sm text-card-foreground text-right" />
                            </StackLayout>
                        </GridLayout>

                        <StackLayout class="bg-border mx-4" style="height: 1" />

                        <!-- Stock Limit -->
                        <GridLayout columns="auto, *, auto" class="p-4">
                            <Label col="0" :text="Icons.lucide('package')" class="lucide text-muted-foreground mr-4" verticalAlignment="center" />
                            <Label col="1" :text="$t('pages.eventHome.stockLimit')" class="text-base text-card-foreground" verticalAlignment="center" />
                            <Label col="2" :text="stockLimitLabel(eventDisplay.hasStockLimit)" :class="stockLimitBadgeClass(eventDisplay.hasStockLimit)" verticalAlignment="center" />
                        </GridLayout>

                        <StackLayout class="bg-border mx-4" style="height: 1" />

                        <!-- Total -->
                        <GridLayout columns="auto, *, auto" class="p-4">
                            <Label col="0" :text="Icons.lucide('wallet')" class="lucide text-muted-foreground mr-4" verticalAlignment="center" />
                            <Label col="1" :text="$t('pages.eventHome.totalValue')" class="text-base text-card-foreground" verticalAlignment="center" />
                            <Label col="2" :text="Format.formatCurrencyBR(eventDisplay.totalValue)" class="text-lg font-bold text-success" verticalAlignment="center" />
                        </GridLayout>

                    </StackLayout>

                    <!-- Orders Card -->
                    <Label :text="$t('pages.eventHome.ordersSection')" class="text-xs font-semibold text-muted-foreground uppercase mt-6 mb-2 px-1" />

                    <StackLayout class="card p-0">

                        <!-- Total Orders -->
                        <GridLayout columns="auto, *, auto" class="p-4">
                            <Label col="0" :text="Icons.lucide('receipt')" class="lucide text-muted-foreground mr-4" verticalAlignment="center" />
                            <Label col="1" :text="$t('pages.eventHome.orders')" class="text-base text-card-foreground" verticalAlignment="center" />
                            <Label col="2" :text="String(eventDisplay.orderCount)" class="text-base font-semibold text-card-foreground" verticalAlignment="center" />
                        </GridLayout>

                        <StackLayout class="bg-border mx-4" style="height: 1" />

                        <!-- Synced -->
                        <GridLayout columns="auto, *, auto" class="p-4">
                            <Label col="0" :text="Icons.lucide('circle-check')" class="lucide text-success mr-4" verticalAlignment="center" />
                            <Label col="1" :text="$t('pages.eventHome.synced')" class="text-base text-card-foreground" verticalAlignment="center" />
                            <Label col="2" :text="String(eventDisplay.ordersSynced)" class="text-base font-semibold text-success" verticalAlignment="center" />
                        </GridLayout>

                        <StackLayout class="bg-border mx-4" style="height: 1" />

                        <!-- Unsynced -->
                        <GridLayout columns="auto, *, auto" class="p-4">
                            <Label col="0" :text="Icons.lucide('clock')" class="lucide text-warning mr-4" verticalAlignment="center" />
                            <Label col="1" :text="$t('pages.eventHome.unsynced')" class="text-base text-card-foreground" verticalAlignment="center" />
                            <Label col="2" :text="String(eventDisplay.ordersUnsynced)" class="text-base font-semibold text-warning" verticalAlignment="center" />
                        </GridLayout>

                    </StackLayout>
                    <!-- Back to events -->
                    <Button :text="$t('pages.eventHome.backToEvents')" class="btn-primary mt-4" @tap="goToEvents" />
                    <Button
                        v-if="isScancodeDesktopIntegrationRequired"
                        :text="Icons.lucide('scan-barcode')"
                        class="lucide btn-primary mt-3"
                        @tap="onScancodeDesktopTap"
                    />

                </StackLayout>
            </ScrollView>
        </GridLayout>
    </Page>
</template>

<script setup lang="ts">
import { computed, type ComputedRef } from 'vue';
import { useTranslation } from '../../../composables/useTranslation';
import { useNavigation } from '../../../composables/useNavigation';
import { useCurrentEvent } from '../../../composables/repository/useCurrentEvent';
import { useScancodeDesktop } from '../../../composables/useScancodeDesktop';
import type { EventItem } from '../../../types/event-item';
import { Icons } from '../../../utils/icons';
import { Format } from '../../../utils/format';
import HeaderComponent from '../../../components/HeaderComponent.vue';
import EventsPage from '../../EventsPage.vue';

type HomeEventDisplay = EventItem & {
    hasStockLimit: boolean;
};

const { t } = useTranslation();
const { navigateTo } = useNavigation();

const currentEvent = useCurrentEvent.getEvent();
const loading = useCurrentEvent.getIsLoading();
const isScancodeDesktopIntegrationRequired = useScancodeDesktop.isScancodeDesktopIntegrationRequired();

const eventDisplay: ComputedRef<HomeEventDisplay | null> = computed(() => {
    const row = currentEvent.value;
    if (!row) {
        return null;
    }
    const orders = row.orders ?? [];
    const totalValue = orders.reduce((sum, order) => {
        const orderTotal = (order.order_items ?? []).reduce(
            (s, item) => s + item.price * item.qty,
            0,
        );
        return sum + orderTotal;
    }, 0);

    return {
        id: row.id,
        name: row.name,
        status: deriveEventStatus(row.start, row.end),
        hasStockLimit: row.has_stock_limit,
        totalValue,
        startDate: Format.formatIsoDateToBR(row.start),
        endDate: Format.formatIsoDateToBR(row.end),
        orderCount: orders.length,
        ordersSynced: orders.filter((o) => o.is_sync).length,
        ordersUnsynced: orders.filter((o) => !o.is_sync).length,
    };
});

const headerTitle: ComputedRef<string> = computed(() => {
    if (loading.value) {
        return '';
    }
    return eventDisplay.value?.name ?? '';
});

function todayYyyyMmDd(): string {
    const n: Date = new Date();
    const y: number = n.getFullYear();
    const m: string = String(n.getMonth() + 1).padStart(2, '0');
    const d: string = String(n.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function deriveEventStatus(start: string, end: string): 'scheduled' | 'in_progress' | 'ended' {
    const today: string = todayYyyyMmDd();
    if (today < start) {
        return 'scheduled';
    }
    if (today > end) {
        return 'ended';
    }
    return 'in_progress';
}

function goToEvents(): void {
    navigateTo(EventsPage, { frame: 'root-frame', clearHistory: true });
}

function onScancodeDesktopTap(): void {
}

function statusLabel(status: string): string {
    switch (status) {
        case 'in_progress': return t('pages.events.statusInProgress');
        case 'scheduled': return t('pages.events.statusScheduled');
        case 'ended': return t('pages.events.statusEnded');
        default: return status;
    }
}

function statusBadgeClass(status: string): string {
    switch (status) {
        case 'in_progress': return 'badge-success';
        case 'scheduled': return 'badge-secondary';
        case 'ended': return 'badge-outline';
        default: return 'badge-outline';
    }
}

function stockLimitLabel(hasStockLimit: boolean): string {
    return hasStockLimit
        ? t('pages.eventHome.stockLimitEnabled')
        : t('pages.eventHome.stockLimitDisabled');
}

function stockLimitBadgeClass(hasStockLimit: boolean): string {
    return hasStockLimit ? 'badge-success' : 'badge-secondary';
}
</script>
