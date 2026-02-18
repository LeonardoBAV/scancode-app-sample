<template>
    <Page>
        <ActionBar title="Perfil">
            <NavigationButton text="Voltar" android.systemIcon="ic_menu_back" @tap="goBack" />
        </ActionBar>

        <StackLayout class="p-4">
            <Label :text="userName" class="text-xl font-bold text-gray-900 mb-2" />
            <StackLayout v-if="distribuidora !== '—'" class="mb-4">
                <Label text="Distribuidora" class="text-xs text-gray-500" />
                <Label :text="distribuidora" class="text-base text-gray-700" />
            </StackLayout>
            <Label text="Menu do perfil" class="text-sm text-gray-500 mb-4" />

            <Button text="Detalhes do Profile" class="bg-gray-600 text-white p-3 rounded-lg mb-3" @tap="goToProfileDetails" />
            <Button text="Sincronização" class="bg-green-600 text-white p-3 rounded-lg mb-3" @tap="onSync" />
            <Button v-if="!isNotVisibleEvents" text="Eventos" class="bg-blue-500 text-white p-3 rounded-lg mb-3" @tap="goToEvents" />
            <Button text="Sair" class="bg-red-500 text-white p-3 rounded-lg" @tap="logout" />
        </StackLayout>
    </Page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, getCurrentInstance } from 'vue'
import { Dialogs } from '@nativescript/core'
import { getAuth, clearAuth } from '../utils/auth'
import Events from './Events.vue'
import ProfileDetails from './ProfileDetails.vue'

withDefaults(defineProps<{ isNotVisibleEvents?: boolean }>(), { isNotVisibleEvents: false })

const profile = ref<ReturnType<typeof getAuth>>(null)
const userName = computed(() => profile.value?.name ?? profile.value?.nick ?? 'Usuário')
const distribuidora = computed(() => profile.value?.distribuidora ?? '—')

onMounted(() => {
    profile.value = getAuth()
})

const instance = getCurrentInstance()
const globals = instance?.appContext.config.globalProperties
const navigateTo = globals?.$navigateTo as (target: unknown, options?: Record<string, unknown>) => void
const navigateBack = globals?.$navigateBack as () => Promise<void> | void

function goBack() {
    return navigateBack?.()
}

function goToEvents() {
    navigateTo?.(Events, { frame: 'root-frame', clearHistory: true })
}

function goToProfileDetails() {
    navigateTo?.(ProfileDetails)
}

function onSync() {
    // TODO: implementar lógica de sincronização
    Dialogs.alert({ title: 'Sincronização', message: 'Sincronização em breve.', okButtonText: 'OK' })
}

function logout() {
    clearAuth()
    import('./Login.vue').then((m) => {
        navigateTo?.(m.default, { frame: 'root-frame', clearHistory: true })
    })
}
</script>
