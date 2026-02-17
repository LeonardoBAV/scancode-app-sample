<template>
    <Page>
        <ActionBar title="Perfil">
            <NavigationButton text="Voltar" android.systemIcon="ic_menu_back" @tap="goBack" />
        </ActionBar>

        <StackLayout class="p-4">
            <Label :text="userName" class="text-xl font-bold text-gray-900 mb-2" />
            <Label text="Menu do perfil" class="text-sm text-gray-500 mb-6" />

            <Button v-if="!isNotVisibleEvents" text="Eventos" class="bg-blue-500 text-white p-3 rounded-lg mb-3" @tap="goToEvents" />
            <Button text="Sair" class="bg-red-500 text-white p-3 rounded-lg" @tap="logout" />
        </StackLayout>
    </Page>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
import { getAuth, clearAuth } from '../utils/auth'
import Events from './Events.vue'

withDefaults(defineProps<{ isNotVisibleEvents?: boolean }>(), { isNotVisibleEvents: false })

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

function logout() {
    clearAuth()
    import('./Login.vue').then((m) => {
        navigateTo?.(m.default, { frame: 'root-frame', clearHistory: true })
    })
}
</script>
