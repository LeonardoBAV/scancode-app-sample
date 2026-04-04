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
            <StackLayout v-else-if="listItems.length === 0" row="1" class="p-8" verticalAlignment="center" horizontalAlignment="center">
                <Label :text="$t('pages.events.empty')" class="text-lg font-semibold text-foreground text-center mb-2" />
                <Label :text="$t('pages.events.emptyHint')" class="text-sm text-muted-foreground text-center" textWrap="true" />
            </StackLayout>

            <!-- Event List -->
            <ListView v-else row="1" :items="listItems" separatorColor="transparent">
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
                                <Label row="2" col="1" :text="formatCurrencyBR(item.totalValue)" class="text-base font-bold text-success mt-2" horizontalAlignment="right" />

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
import { computed, getCurrentInstance, type ComputedRef } from 'vue';
import { eventSchemaToEventItem } from '../utils/event-display';
import { useTranslation } from '../composables/useTranslation';
import { useEvents } from '../composables/useEvents';
import { formatCurrencyBR } from '../utils/format';
import HeaderComponent from '../components/HeaderComponent.vue';
import DefaultLayout from '../layouts/Default.vue';
import type { EventItem } from '../types/event-item';


// --- Component logic ---
const { t } = useTranslation();
const { events, isLoading } = useEvents();

const listItems: ComputedRef<EventItem[]> = computed(() => events.value.map(eventSchemaToEventItem));

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
</script>
