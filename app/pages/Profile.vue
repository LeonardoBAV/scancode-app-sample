<template>
    <Page>
        <ActionBar title="Perfil">
            <NavigationButton text="Voltar" android.systemIcon="ic_menu_back" @tap="goBack" />
        </ActionBar>

        <StackLayout class="p-4">
            <Label :text="userName" class="text-xl font-bold text-gray-900 mb-2" />
            <Label text="Menu do perfil (em breve)" class="text-sm text-gray-500 mb-6" />

            <Button text="Sair" class="bg-blue-500 text-white p-3 rounded-lg" @tap="logout" />
        </StackLayout>
    </Page>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
import { getAuth, clearAuth } from '../utils/auth'

const userName = ref(getAuth()?.name ?? 'Usuário')

const instance = getCurrentInstance()
const globals = instance?.appContext.config.globalProperties
const navigateTo = globals?.$navigateTo as (target: unknown, options?: { clearHistory?: boolean }) => void
const navigateBack = globals?.$navigateBack as () => Promise<void> | void

function goBack() {
    return navigateBack?.()
}

function logout() {
    clearAuth()
    import('./Login.vue').then((m) => {
        navigateTo?.(m.default, { clearHistory: true })
    })
}
</script>
