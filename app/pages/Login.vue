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
import { ApplicationSettings } from '@nativescript/core'
import Events from './Events.vue'

const SESSION_KEY = 'user_session'
const USER_NAME_KEY = 'user_name'

const HARDCODED_USER = 'leo'
const HARDCODED_PASS = '123'
const HARDCODED_USERNAME = 'Leonardo Vasconcelos'

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
        ApplicationSettings.setString(SESSION_KEY, 'logged_in')
        const displayName = HARDCODED_USERNAME; //user.charAt(0).toUpperCase() + user.slice(1)
        ApplicationSettings.setString(USER_NAME_KEY, displayName)
        goToEvents()
    } else {
        errorMessage.value = 'Usuário ou senha inválidos.'
    }
}

function goToEvents() {
    navigateTo?.(Events, { clearHistory: true })
}

onMounted(() => {
    if (ApplicationSettings.getString(SESSION_KEY)) {
        // Defer so setRootApp() has run (nativescript-vue needs rootApp._context for $navigateTo)
        setTimeout(() => goToEvents(), 0)
    }
})
</script>

<!--
<script lang="ts">
import { ApplicationSettings } from '@nativescript/core'
import Home from './Home.vue'

const SESSION_KEY = 'user_session'
const HARDCODED_USER = 'leo'
const HARDCODED_PASS = '123'

export default {
    data() {
        return {
            username: '',
            password: '',
            errorMessage: '' as string,
        }
    },

    mounted() {
        const session = ApplicationSettings.getString(SESSION_KEY)
        if (session) {
            this.goToHome()
        }
    },

    methods: {
        onLogin() {
            this.errorMessage = ''
            const user = (this as any).username.trim()
            const pass = (this as any).password

            if (user === HARDCODED_USER && pass === HARDCODED_PASS) {
                ApplicationSettings.setString(SESSION_KEY, 'logged_in')
                this.goToHome()
            } else {
                this.errorMessage = 'Usuário ou senha inválidos.'
            }
        },

        goToHome() {
            ;(this as any).$navigateTo(Home, { clearHistory: true })
        },
    },
}
</script>
-->
