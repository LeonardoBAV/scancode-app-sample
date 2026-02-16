<template>
    <Page>
        <ActionBar class="action-bar">
            <Label text="Eventos" class="font-bold text-lg" />
            <ActionItem text="👤 Perfil" @tap="openProfileMenu" />
        </ActionBar>

        <ScrollView>
            <StackLayout class="list p-3">
                <GridLayout v-for="(event, index) in events" :key="index" rows="auto, auto" columns="*, auto" class="event-item p-3 mb-2 rounded-lg border border-gray-200">
                    <Label row="0" col="0" :text="event.nome" class="text-base font-bold text-gray-900" textWrap="true" />
                    <Label row="0" col="1" :text="event.status" :class="'text-sm font-semibold ' + statusClass(event.status)" horizontalAlignment="right" />
                    <Label row="1" col="0" :text="event.dataInicio + ' - ' + event.dataFim + ' · ' + event.numeroPedidos + ' pedidos'" class="text-sm text-gray-500 mt-1" textWrap="true" />
                    <Label row="1" col="1" :text="formatValor(event.valor)" class="text-sm font-semibold text-blue-600 mt-1" horizontalAlignment="right" />
                </GridLayout>
            </StackLayout>
        </ScrollView>
    </Page>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
import { ApplicationSettings } from '@nativescript/core'
import ProfileMenu from '../components/ProfileMenu.vue'

const USER_NAME_KEY = 'user_name'
const SESSION_KEY = 'user_session'

interface Evento {
    nome: string
    status: string
    valor: number
    dataInicio: string
    dataFim: string
    numeroPedidos: number
}

const events = ref<Evento[]>([
    { nome: 'Festa de Aniversário', status: 'Ativo', valor: 1500, dataInicio: '20/02/2025', dataFim: '21/02/2025', numeroPedidos: 45 },
    { nome: 'Workshop Tech', status: 'Agendado', valor: 320, dataInicio: '01/03/2025', dataFim: '01/03/2025', numeroPedidos: 12 },
    { nome: 'Conferência 2025', status: 'Encerrado', valor: 5000, dataInicio: '10/01/2025', dataFim: '12/01/2025', numeroPedidos: 120 },
    { nome: 'Meetup Dev', status: 'Ativo', valor: 0, dataInicio: '15/02/2025', dataFim: '15/02/2025', numeroPedidos: 28 },
])

const userName = ref(ApplicationSettings.getString(USER_NAME_KEY) || 'Usuário')

const instance = getCurrentInstance()
const globals = instance?.appContext.config.globalProperties
const navigateTo = globals?.$navigateTo as (target: unknown, options?: { clearHistory?: boolean }) => void
const showModal = globals?.$showModal as (component: unknown, options?: { props?: Record<string, unknown>; closeCallback?: (result: string) => void }) => Promise<unknown>

function formatValor(valor: number): string {
    return valor === 0 ? 'Grátis' : 'R$ ' + valor.toLocaleString('pt-BR')
}

function statusClass(status: string): string {
    switch (status) {
        case 'Ativo':
            return 'text-green-600'
        case 'Agendado':
            return 'text-blue-600'
        case 'Encerrado':
            return 'text-gray-500'
        default:
            return 'text-gray-600'
    }
}

function openProfileMenu() {
    showModal?.(ProfileMenu, {
        props: { userName: userName.value },
        closeCallback: (result: string) => {
            if (result === 'logout') logout()
        },
    })
}

function logout() {
    ApplicationSettings.remove(SESSION_KEY)
    ApplicationSettings.remove(USER_NAME_KEY)
    import('./Login.vue').then((m) => {
        navigateTo?.(m.default, { clearHistory: true })
    })
}
</script>

<style scoped>
.event-item {
    background-color: #fafafa;
}
</style>
