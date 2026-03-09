<template>
    <Page actionBarHidden="true">
        <GridLayout rows="auto, *" class="bg-background">
            <HeaderComponent row="0" :title="event.name" />
            <ScrollView row="1">
                <StackLayout class="p-4 pb-8">

                    <!-- Back to events -->
                    <Button :text="$t('pages.eventHome.backToEvents')" class="btn-primary mb-4" @tap="goToEvents" />

                    <!-- Summary Card -->
                    <StackLayout class="card p-0">

                        <!-- Status + Date -->
                        <GridLayout columns="*, auto" class="p-4">
                            <StackLayout col="0">
                                <Label :text="$t('pages.eventHome.status')" class="text-xs text-muted-foreground mb-1" />
                                <Label :text="statusLabel(event.status)" :class="statusBadgeClass(event.status)" horizontalAlignment="left" />
                            </StackLayout>
                            <StackLayout col="1" horizontalAlignment="right">
                                <Label :text="$t('pages.eventHome.date')" class="text-xs text-muted-foreground mb-1 text-right" />
                                <Label :text="event.startDate + ' — ' + event.endDate" class="text-sm text-card-foreground text-right" />
                            </StackLayout>
                        </GridLayout>

                        <StackLayout class="bg-border mx-4" style="height: 1" />

                        <!-- Total -->
                        <GridLayout columns="auto, *, auto" class="p-4">
                            <Label col="0" :text="lucide('wallet')" class="lucide text-muted-foreground mr-4" verticalAlignment="center" />
                            <Label col="1" :text="$t('pages.eventHome.totalValue')" class="text-base text-card-foreground" verticalAlignment="center" />
                            <Label col="2" :text="formatCurrencyBR(event.totalValue, $t('common.free'))" class="text-lg font-bold text-success" verticalAlignment="center" />
                        </GridLayout>

                    </StackLayout>

                    <!-- Orders Card -->
                    <Label :text="$t('pages.eventHome.ordersSection')" class="text-xs font-semibold text-muted-foreground uppercase mt-6 mb-2 px-1" />

                    <StackLayout class="card p-0">

                        <!-- Total Orders -->
                        <GridLayout columns="auto, *, auto" class="p-4">
                            <Label col="0" :text="lucide('receipt')" class="lucide text-muted-foreground mr-4" verticalAlignment="center" />
                            <Label col="1" :text="$t('pages.eventHome.orders')" class="text-base text-card-foreground" verticalAlignment="center" />
                            <Label col="2" :text="String(event.orderCount)" class="text-base font-semibold text-card-foreground" verticalAlignment="center" />
                        </GridLayout>

                        <StackLayout class="bg-border mx-4" style="height: 1" />

                        <!-- Synced -->
                        <GridLayout columns="auto, *, auto" class="p-4">
                            <Label col="0" :text="lucide('circle-check')" class="lucide text-success mr-4" verticalAlignment="center" />
                            <Label col="1" :text="$t('pages.eventHome.synced')" class="text-base text-card-foreground" verticalAlignment="center" />
                            <Label col="2" :text="String(event.ordersSynced)" class="text-base font-semibold text-success" verticalAlignment="center" />
                        </GridLayout>

                        <StackLayout class="bg-border mx-4" style="height: 1" />

                        <!-- Unsynced -->
                        <GridLayout columns="auto, *, auto" class="p-4">
                            <Label col="0" :text="lucide('clock')" class="lucide text-warning mr-4" verticalAlignment="center" />
                            <Label col="1" :text="$t('pages.eventHome.unsynced')" class="text-base text-card-foreground" verticalAlignment="center" />
                            <Label col="2" :text="String(event.ordersUnsynced)" class="text-base font-semibold text-warning" verticalAlignment="center" />
                        </GridLayout>

                    </StackLayout>

                </StackLayout>
            </ScrollView>
        </GridLayout>
    </Page>
</template>

<script setup lang="ts">
import { getCurrentInstance } from 'vue';
import { useTranslation } from '../../../composables/useTranslation';
import type { EventItem } from '../../../types/event-item';
import { lucide } from '../../../utils/icons';
import { formatCurrencyBR } from '../../../utils/format';
import HeaderComponent from '../../../components/HeaderComponent.vue';
import EventsPage from '../../EventsPage.vue';

const { t } = useTranslation();

const props = defineProps<{ event: EventItem }>();
const event = props.event;

const instance = getCurrentInstance();
const navigateTo = instance?.appContext.config.globalProperties.$navigateTo as (
    target: unknown,
    options?: Record<string, unknown>,
) => void;

function goToEvents(): void {
    navigateTo?.(EventsPage, { frame: 'root-frame', clearHistory: true });
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
</script>
