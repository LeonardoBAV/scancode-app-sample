<template>
    <Frame>
        <Page class="profile-menu-page">
            <ActionBar title="Perfil">
                <NavigationButton text="✕" @tap="close" />
            </ActionBar>
            <StackLayout class="p-4">
                <Label :text="userName" class="text-xl font-bold text-gray-900 mb-4" />
                <Button text="Sair" class="bg-red-500 text-white p-3 rounded-lg" @tap="onLogout" />
            </StackLayout>
        </Page>
    </Frame>
</template>

<script setup lang="ts">
import { getCurrentInstance } from 'vue'

defineProps<{ userName: string }>()

const instance = getCurrentInstance()
const getModalClose = () => instance?.appContext.config.globalProperties.$closeModal

function close() {
    getModalClose()?.()
}

function onLogout() {
    getModalClose()?.('logout')
}
</script>

<style scoped>
.profile-menu-page {
    background-color: white;
}
</style>
