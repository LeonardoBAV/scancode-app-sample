<template>
    <Page actionBarHidden="true">
        <GridLayout rows="auto, *" class="bg-background">

            <!-- Header -->
            <GridLayout row="0" columns="*, auto" class="px-4 py-3 border-b border-border">
                <Label col="0" :text="$t('pages.events.title')" class="text-xl font-bold text-foreground" verticalAlignment="center" />
                <Label col="1" :text="userInitials" class="text-sm font-bold text-primary-foreground bg-primary w-10 h-10 rounded-full text-center" verticalAlignment="center" @tap="openProfileMenu" />
            </GridLayout>

            <!-- Empty State -->
            <StackLayout v-if="events.length === 0" row="1" class="p-8" verticalAlignment="center" horizontalAlignment="center">
                <Label :text="$t('pages.events.empty')" class="text-lg font-semibold text-foreground text-center mb-2" />
                <Label :text="$t('pages.events.emptyHint')" class="text-sm text-muted-foreground text-center" textWrap="true" />
            </StackLayout>

            <!-- Event List -->
            <ListView v-else row="1" :items="events" separatorColor="transparent">
                <template #default="{ item }">
                    <StackLayout class="px-4 pt-3">
                        <GridLayout rows="auto, auto, auto" columns="*, auto" class="card" androidElevation="2" @tap="openEvent(item)">

                            <!-- Row 0: Name + Badge -->
                            <Label row="0" col="0" :text="item.name" class="text-base font-semibold text-card-foreground mr-2" textWrap="true" />
                            <Label row="0" col="1" :text="statusLabel(item.status)" :class="statusBadgeClass(item.status)" verticalAlignment="top" horizontalAlignment="right" />

                            <!-- Row 1: Date range -->
                            <Label row="1" col="0" colSpan="2" :text="item.startDate + '  —  ' + item.endDate" class="text-sm text-muted-foreground mt-2" />

                            <!-- Row 2: Orders + Value -->
                            <Label row="2" col="0" :text="item.orderCount + ' ' + $t('common.orders')" class="text-sm text-muted-foreground mt-2" />
                            <Label row="2" col="1" :text="formatCurrencyBR(item.totalValue, $t('common.free'))" class="text-base font-bold text-foreground mt-2" horizontalAlignment="right" />

                        </GridLayout>
                    </StackLayout>
                </template>
            </ListView>

        </GridLayout>
    </Page>
</template>

<script setup lang="ts">
import { ref, computed, getCurrentInstance } from 'vue';
import { useTranslation } from '../composables/useTranslation';
import { getAuth, clearAuth } from '../utils/auth';
import Profile from './Profile/Profile.vue';
import DefaultLayout from '../layouts/Default.vue';
import LoginPage from './LoginPage.vue';
import type { EventItem } from '../types/event-item';
import { formatCurrencyBR } from '../utils/format';

const { t } = useTranslation();

const auth = getAuth();
const userInitials = computed(() => {
    const name = auth?.name ?? auth?.nick ?? '';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
});

const instance = getCurrentInstance();
const globals = instance?.appContext.config.globalProperties;
const navigateTo = globals?.$navigateTo as (target: unknown, options?: Record<string, unknown>) => void;

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

function openEvent(event: EventItem): void {
    navigateTo?.(DefaultLayout, { frame: 'root-frame', props: { event }, clearHistory: true });
}

function openProfileMenu(): void {
    navigateTo?.(Profile, { frame: 'root-frame' });
}

const events = ref<EventItem[]>([
    { name: 'Birthday Party', status: 'in_progress', totalValue: 1500, startDate: '20/02/2025', endDate: '21/02/2025', orderCount: 45, ordersSynced: 42, ordersUnsynced: 3 },
    { name: 'Tech Workshop', status: 'scheduled', totalValue: 320, startDate: '01/03/2025', endDate: '01/03/2025', orderCount: 12, ordersSynced: 12, ordersUnsynced: 0 },
    { name: 'Conference 2025', status: 'ended', totalValue: 5000, startDate: '10/01/2025', endDate: '12/01/2025', orderCount: 120, ordersSynced: 120, ordersUnsynced: 0 },
    { name: 'Dev Meetup', status: 'in_progress', totalValue: 0, startDate: '15/02/2025', endDate: '15/02/2025', orderCount: 28, ordersSynced: 25, ordersUnsynced: 3 },
    { name: 'Summer Festival', status: 'scheduled', totalValue: 8200, startDate: '15/06/2025', endDate: '17/06/2025', orderCount: 0, ordersSynced: 0, ordersUnsynced: 0 },
    { name: 'Corporate Gala', status: 'in_progress', totalValue: 12400, startDate: '05/03/2025', endDate: '05/03/2025', orderCount: 210, ordersSynced: 198, ordersUnsynced: 12 },
    { name: 'Food Truck Rally', status: 'ended', totalValue: 3750, startDate: '02/02/2025', endDate: '02/02/2025', orderCount: 87, ordersSynced: 87, ordersUnsynced: 0 },
    { name: 'Music Night', status: 'in_progress', totalValue: 960, startDate: '28/02/2025', endDate: '28/02/2025', orderCount: 34, ordersSynced: 30, ordersUnsynced: 4 },
    { name: 'Startup Demo Day', status: 'scheduled', totalValue: 0, startDate: '20/04/2025', endDate: '20/04/2025', orderCount: 0, ordersSynced: 0, ordersUnsynced: 0 },
    { name: 'Wine Tasting', status: 'ended', totalValue: 2100, startDate: '14/01/2025', endDate: '14/01/2025', orderCount: 56, ordersSynced: 56, ordersUnsynced: 0 },
    { name: 'Charity Run 2025', status: 'scheduled', totalValue: 0, startDate: '10/05/2025', endDate: '10/05/2025', orderCount: 0, ordersSynced: 0, ordersUnsynced: 0 },
]);

</script>
