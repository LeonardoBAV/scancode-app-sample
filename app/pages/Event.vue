<template>
    <Page actionBarHidden="true">
        <ScrollView>
            <StackLayout class="p-4">
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
    </Page>
</template>

<script setup lang="ts">
import type { EventItem } from '../types/event-item'

const props = defineProps<{ event: EventItem }>()
const event = props.event

function formatValor(valor: number): string {
    return valor === 0 ? 'Free' : 'R$ ' + valor.toLocaleString('pt-BR')
}

function statusClass(status: string): string {
    switch (status) {
        case 'Active':
            return 'text-green-600'
        case 'Scheduled':
            return 'text-blue-600'
        case 'Ended':
            return 'text-gray-500'
        default:
            return 'text-gray-600'
    }
}
</script>
