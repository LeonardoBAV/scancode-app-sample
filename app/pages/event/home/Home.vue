<template>
    <Page actionBarHidden="true">
        <GridLayout rows="*" columns="*">
            <ScrollView row="0" col="0">
                <StackLayout class="p-4 pb-8">
                    <Label :text="event.name" class="text-xl font-bold text-gray-900 mb-2" />

                    <GridLayout rows="auto, auto, auto, auto, auto, auto" columns="auto, *" class="mt-2">
                        <Label row="0" col="0" text="Status" class="text-sm text-gray-500 mr-2" />
                        <Label row="0" col="1" :text="event.status" :class="'text-sm font-semibold ' + statusClass(event.status)" />

                        <Label row="1" col="0" text="Orders" class="text-sm text-gray-500 mr-2 mt-1" />
                        <Label row="1" col="1" :text="String(event.orderCount)" class="text-sm font-semibold text-gray-900 mt-1" />

                        <Label row="2" col="0" text="Synced orders" class="text-sm text-gray-500 mr-2 mt-1" />
                        <Label row="2" col="1" :text="String(event.ordersSynced)" class="text-sm font-semibold text-green-600 mt-1" />

                        <Label row="3" col="0" text="Unsynced orders" class="text-sm text-gray-500 mr-2 mt-1" />
                        <Label row="3" col="1" :text="String(event.ordersUnsynced)" class="text-sm font-semibold text-amber-600 mt-1" />

                        <Label row="4" col="0" text="Total value" class="text-sm text-gray-500 mr-2 mt-1" />
                        <Label row="4" col="1" :text="formatValor(event.totalValue)" class="text-sm font-semibold text-blue-600 mt-1" />

                        <Label row="5" col="0" text="Date" class="text-sm text-gray-500 mr-2 mt-1" />
                        <Label row="5" col="1" :text="event.startDate + ' - ' + event.endDate" class="text-sm font-semibold text-gray-900 mt-1" />
                    </GridLayout>
                </StackLayout>
            </ScrollView>
            <Button
                row="0"
                col="0"
                text="Events"
                class="fab-events"
                horizontalAlignment="stretch"
                verticalAlignment="bottom"
                @tap="goToEvents"
            />
        </GridLayout>
    </Page>
</template>

<script setup lang="ts">
import { getCurrentInstance } from 'vue';
import type { EventItem } from '../../types/event-item';
import EventsPage from '../../EventsPage.vue';

const props = defineProps<{ event: EventItem }>();
const event = props.event;

const instance = getCurrentInstance();
const globals = instance?.appContext.config.globalProperties;
const navigateTo = globals?.$navigateTo as (target: unknown, options?: Record<string, unknown>) => void;

function goToEvents(): void {
    navigateTo?.(EventsPage, { frame: 'root-frame', clearHistory: true });
}

function formatValor(valor: number): string {
    return valor === 0 ? 'Free' : 'R$ ' + valor.toLocaleString('pt-BR');
}

function statusClass(status: string): string {
    switch (status) {
        case 'Active':
            return 'text-green-600';
        case 'Scheduled':
            return 'text-blue-600';
        case 'Ended':
            return 'text-gray-500';
        default:
            return 'text-gray-600';
    }
}
</script>

<style scoped>
.fab-events {
    margin: 16;
    padding: 14;
    font-size: 16;
    font-weight: 600;
    background-color: #3b82f6;
    color: white;
    border-radius: 8;
}
</style>
