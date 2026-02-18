<template>
    <Page>
        <ActionBar title="Detalhes do Perfil">
            <NavigationButton text="Voltar" android.systemIcon="ic_menu_back" @tap="goBack" />
        </ActionBar>

        <ScrollView>
            <StackLayout class="p-4">
                <StackLayout class="mb-4 p-3 bg-gray-100 rounded-lg">
                    <Label text="Nome" class="text-xs text-gray-500" />
                    <Label :text="profile?.name ?? '—'" class="text-base text-gray-900" />
                </StackLayout>
                <StackLayout class="mb-4 p-3 bg-gray-100 rounded-lg">
                    <Label text="Usuário (nick)" class="text-xs text-gray-500" />
                    <Label :text="profile?.nick ?? '—'" class="text-base text-gray-900" />
                </StackLayout>
                <StackLayout class="mb-4 p-3 bg-gray-100 rounded-lg">
                    <Label text="E-mail" class="text-xs text-gray-500" />
                    <Label :text="profile?.email ?? '—'" class="text-base text-gray-900" />
                </StackLayout>
                <StackLayout class="mb-4 p-3 bg-gray-100 rounded-lg">
                    <Label text="CPF" class="text-xs text-gray-500" />
                    <Label :text="profile?.cpf ?? '—'" class="text-base text-gray-900" />
                </StackLayout>
                <StackLayout class="mb-4 p-3 bg-gray-100 rounded-lg">
                    <Label text="Distribuidora" class="text-xs text-gray-500" />
                    <Label :text="profile?.distribuidora ?? '—'" class="text-base text-gray-900" />
                </StackLayout>
            </StackLayout>
        </ScrollView>
    </Page>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance } from 'vue'
import { getAuth } from '../utils/auth'

const profile = ref<ReturnType<typeof getAuth>>(null)

onMounted(() => {
    profile.value = getAuth()
})

const instance = getCurrentInstance()
const globals = instance?.appContext.config.globalProperties
const navigateBack = globals?.$navigateBack as () => Promise<void> | void

function goBack() {
    return navigateBack?.()
}
</script>
