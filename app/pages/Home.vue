<template>
    <Page>
        <ActionBar>
            <Label text="Home" class="font-bold text-lg" />
        </ActionBar>

        <GridLayout rows="*, auto, auto, *" columns="*">
            <Button row="1" text="Leonardo" class="text-xl text-center text-white bg-blue-500 p-4 rounded-lg" horizontalAlignment="center" verticalAlignment="middle" @tap="logMessage" />
            <Button row="2" text="Sair" class="text-base text-gray-600 mt-4" horizontalAlignment="center" @tap="logout" />
        </GridLayout>
    </Page>
</template>

<script setup lang="ts">
import { getCurrentInstance } from 'vue'
import { clearAuth } from '../utils/auth'

// Capture $navigateTo during setup; getCurrentInstance() is null inside tap/async callbacks
const instance = getCurrentInstance()
const navigateTo = instance?.appContext.config.globalProperties.$navigateTo as (target: unknown, options?: { clearHistory?: boolean }) => void

function logMessage() {
    console.log('You have tapped the message!')
}

function logout() {
    clearAuth()
    import('./Login.vue').then((m) => {
        navigateTo?.(m.default, { clearHistory: true })
    })
}
</script>
