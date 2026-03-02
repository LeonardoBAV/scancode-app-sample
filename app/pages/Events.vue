<template>
    <Page>
        <ActionBar class="action-bar">
            <Label text="Eventos" class="font-bold text-lg" />
            <ActionItem text="👤 Perfil" @tap="openProfileMenu" />
        </ActionBar>

        <ScrollView>
            <StackLayout class="list p-3">
                <GridLayout v-for="(event, index) in events" :key="index" rows="auto, auto" columns="*, auto" class="event-item p-3 mb-2 rounded-lg border border-gray-200" @tap="openEvent(event)">
                    <Label row="0" col="0" :text="event.name" class="text-base font-bold text-gray-900" textWrap="true" />
                    <Label row="0" col="1" :text="event.status" :class="'text-sm font-semibold ' + statusClass(event.status)" horizontalAlignment="right" />
                    <Label row="1" col="0" :text="event.startDate + ' - ' + event.endDate + ' · ' + event.orderCount + ' orders'" class="text-sm text-gray-500 mt-1" textWrap="true" />
                    <Label row="1" col="1" :text="formatValor(event.totalValue)" class="text-sm font-semibold text-blue-600 mt-1" horizontalAlignment="right" />
                </GridLayout>
            </StackLayout>
        </ScrollView>
    </Page>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
import Profile from './Profile/Profile.vue';
import DefaultLayout from '../layouts/Default.vue';
import LoginPage from './LoginPage.vue';
import { clearAuth } from '../utils/auth';
import type { EventItem } from '../types/event-item'

const events = ref<EventItem[]>([
    { name: 'Birthday Party', status: 'Active', totalValue: 1500, startDate: '20/02/2025', endDate: '21/02/2025', orderCount: 45, ordersSynced: 42, ordersUnsynced: 3 },
    { name: 'Tech Workshop', status: 'Scheduled', totalValue: 320, startDate: '01/03/2025', endDate: '01/03/2025', orderCount: 12, ordersSynced: 12, ordersUnsynced: 0 },
    { name: 'Conference 2025', status: 'Ended', totalValue: 5000, startDate: '10/01/2025', endDate: '12/01/2025', orderCount: 120, ordersSynced: 120, ordersUnsynced: 0 },
    { name: 'Dev Meetup', status: 'Active', totalValue: 0, startDate: '15/02/2025', endDate: '15/02/2025', orderCount: 28, ordersSynced: 25, ordersUnsynced: 3 },
])

const instance = getCurrentInstance()
const globals = instance?.appContext.config.globalProperties
const navigateTo = globals?.$navigateTo as (target: unknown, options?: Record<string, unknown>) => void

function formatValor(valor: number): string {
    return valor === 0 ? 'Grátis' : 'R$ ' + valor.toLocaleString('pt-BR')
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

function openEvent(event: EventItem) {
    navigateTo?.(DefaultLayout, { frame: 'root-frame', props: { event }, clearHistory: true })
}

function openProfileMenu() {
    navigateTo?.(Profile, { frame: 'root-frame' });
}

function logout(): void {
    clearAuth();
    navigateTo?.(LoginPage, { frame: 'root-frame', clearHistory: true });
}
</script>

<style scoped>
.event-item {
    background-color: #fafafa;
}
</style>
