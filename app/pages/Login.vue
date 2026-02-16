<template>
    <Page>
        <ActionBar>
            <Label text="Login" class="font-bold text-lg" />
        </ActionBar>

        <GridLayout rows="*, auto, auto, auto, *" columns="*" class="p-8">
            <StackLayout row="1" verticalAlignment="middle">
                <TextField v-model="username" hint="Usuário" class="p-4 mb-4 rounded-lg border border-gray-300 text-lg" :secure="false" />
                <TextField v-model="password" hint="Senha" class="p-4 mb-4 rounded-lg border border-gray-300 text-lg" :secure="true" />
                <Label v-if="errorMessage" :text="errorMessage" class="text-red-500 text-center mb-2" textWrap="true" />
                <Button text="Entrar" class="text-lg text-white bg-blue-500 p-4 rounded-lg" @tap="onLogin" />
            </StackLayout>
        </GridLayout>
    </Page>
</template>


<script setup lang="ts">
import { ref, onMounted, getCurrentInstance } from 'vue'
import Events from './Events.vue'
import { getAuth, setAuth } from '../utils/auth'

const HARDCODED_USER = 'leo'
const HARDCODED_PASS = '123'
const HARDCODED_NAME = 'Leonardo Vasconcelos'
const HARDCODED_CPF = '12345678901'
const HARDCODED_EMAIL = 'leo@example.com'

const username = ref('')
const password = ref('')
const errorMessage = ref('')

// Capture $navigateTo during setup; getCurrentInstance() is null inside tap handler
const instance = getCurrentInstance()
const navigateTo = instance?.appContext.config.globalProperties.$navigateTo as (target: unknown, options?: { clearHistory?: boolean }) => void

function onLogin() {
    errorMessage.value = ''
    const user = username.value.trim()
    const pass = password.value
    if (user === HARDCODED_USER && pass === HARDCODED_PASS) {
        setAuth({
            nick: user,
            name: HARDCODED_NAME,
            cpf: HARDCODED_CPF,
            email: HARDCODED_EMAIL,
            senha: pass,
        })
        goToEvents()
    } else {
        errorMessage.value = 'Usuário ou senha inválidos.'
    }
}

function goToEvents() {
    navigateTo?.(Events, { clearHistory: true })
}

onMounted(() => {
    if (getAuth()) {
        // Defer so setRootApp() has run (nativescript-vue needs rootApp._context for $navigateTo)
        setTimeout(() => goToEvents(), 0)
    }
})
</script>