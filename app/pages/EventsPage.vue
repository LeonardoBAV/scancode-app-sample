<template>
    <Page actionBarHidden="true">
        <GridLayout rows="auto, *" class="bg-background">

            <!-- Header -->
            <HeaderComponent row="0" :title="$t('pages.events.title')" />

            <!-- Loading -->
            <StackLayout v-if="isLoading" row="1" class="p-8" verticalAlignment="center" horizontalAlignment="center">
                <Label :text="$t('common.loading')" class="text-base text-muted-foreground text-center" textWrap="true" />
            </StackLayout>

            <!-- Empty State -->
            <StackLayout v-else-if="items.length === 0" row="1" class="p-8" verticalAlignment="center" horizontalAlignment="center">
                <Label :text="$t('pages.events.empty')" class="text-lg font-semibold text-foreground text-center mb-2" />
                <Label :text="$t('pages.events.emptyHint')" class="text-sm text-muted-foreground text-center" textWrap="true" />
            </StackLayout>

            <!-- Event List -->
            <ListView v-else row="1" :items="items" separatorColor="transparent">
                <template #default="{ item }">
                    <StackLayout class="px-4 pt-3">
                        <StackLayout class="card p-0" androidElevation="2" @tap="openEvent(item)">
                            <GridLayout rows="auto, auto, auto" columns="*, auto" class="p-4">

                                <!-- Row 0: Name + Badge -->
                                <Label row="0" col="0" :text="item.name" class="text-base font-semibold text-card-foreground mr-2" textWrap="true" />
                                <Label row="0" col="1" :text="statusLabel(item.status)" :class="statusBadgeClass(item.status)" verticalAlignment="top" horizontalAlignment="right" />

                                <!-- Row 1: Date range -->
                                <Label row="1" col="0" colSpan="2" :text="item.startDate + '  —  ' + item.endDate" class="text-sm text-muted-foreground mt-2" />

                                <!-- Row 2: Orders + Value -->
                                <Label row="2" col="0" :text="item.orderCount + ' ' + $t('common.orders')" class="text-sm text-muted-foreground mt-2" />
                                <Label row="2" col="1" :text="Format.formatCurrencyBR(item.totalValue)" class="text-base font-bold text-success mt-2" horizontalAlignment="right" />

                            </GridLayout>
                        </StackLayout>
                    </StackLayout>
                </template>
            </ListView>

        </GridLayout>
    </Page>
</template>

<script setup lang="ts">
// --- Imports ---
import { computed, type ComputedRef } from 'vue';
import { Format } from '../utils/format';
import { EventsComposable } from '../composables/event-composable';
import { useCurrentEvent } from '../composables/repository/useCurrentEvent';
import { useTranslation } from '../composables/useTranslation';
import { useNavigation } from '../composables/useNavigation';
import HeaderComponent from '../components/HeaderComponent.vue';
import DefaultLayout from '../layouts/Default.vue';
import type { Event } from '../types/schema/event';
import type { EventItem } from '../types/event-item';


const { t } = useTranslation();
const { navigateTo } = useNavigation();
const events = EventsComposable.getList();
const isLoading = EventsComposable.getIsLoading();

const items: ComputedRef<EventItem[]> = computed(() =>
    events.value.map((row: Event): EventItem => {
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
            totalValue,
            startDate: Format.formatIsoDateToBR(row.start),
            endDate: Format.formatIsoDateToBR(row.end),
            orderCount: orders.length,
            ordersSynced: orders.filter((o) => o.is_sync).length,
            ordersUnsynced: orders.filter((o) => !o.is_sync).length,
        };
    }),
);

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

async function openEvent(event: EventItem): Promise<void> {
    await useCurrentEvent.setEvent(event.id);
    navigateTo(DefaultLayout, { frame: 'root-frame', clearHistory: true });
}
</script>
