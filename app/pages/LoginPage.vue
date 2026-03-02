<template>
    <Page actionBarHidden="true">
        <GridLayout rows="2*, auto, 3*" class="bg-background p-8">

            <!-- Branding -->
            <StackLayout row="0" verticalAlignment="bottom" class="mb-10">
                <Label text="OY" class="text-xl font-bold text-primary-foreground bg-primary w-16 h-16 rounded-full text-center" horizontalAlignment="center" verticalAlignment="center" />
                <Label :text="$t('login.title')" class="text-2xl font-bold text-foreground text-center mt-4" />
                <Label :text="$t('login.subtitle')" class="text-sm text-muted-foreground text-center mt-1" />
            </StackLayout>

            <!-- Form -->
            <StackLayout row="1">
                <StackLayout class="mb-4">
                    <Label :text="$t('login.username')" class="text-sm font-medium text-foreground mb-1" />
                    <TextField v-model="username" :hint="$t('login.usernamePlaceholder')" class="input-field" placeholderColor="#a1a1aa" autocorrect="false" autocapitalizationType="none" />
                </StackLayout>

                <StackLayout class="mb-5">
                    <Label :text="$t('login.password')" class="text-sm font-medium text-foreground mb-1" />
                    <TextField v-model="password" :hint="$t('login.passwordPlaceholder')" :secure="true" class="input-field" placeholderColor="#a1a1aa" />
                </StackLayout>

                <Label v-if="errorMessage" :text="errorMessage" class="text-sm text-destructive text-center mb-3" textWrap="true" />

                <Button :text="$t('login.submit')" class="btn-primary text-lg p-4" @tap="onLogin" />
            </StackLayout>

            <!-- Footer -->
            <StackLayout row="2" verticalAlignment="bottom" class="pb-4">
                <StackLayout class="separator" />
                <Label :text="`v${appVersion}`" class="text-xs text-muted-foreground text-center mt-2" />
            </StackLayout>

        </GridLayout>
    </Page>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance } from 'vue';
import Events from './Events.vue';
import { getAuth, setAuth } from '../utils/auth';
import { useTranslation } from '../composables/useTranslation';
import { useAppVersion } from '../composables/useAppVersion';

const { t } = useTranslation();
const appVersion = useAppVersion();

const username = ref('');
const password = ref('');
const errorMessage = ref('');


const instance = getCurrentInstance();
const navigateTo = instance?.appContext.config.globalProperties.$navigateTo as (
    target: unknown,
    options?: Record<string, unknown>
) => void;

function onLogin(): void {
    errorMessage.value = '';
    const user = username.value.trim();
    const pass = password.value;

    if (user === HARDCODED_USER && pass === HARDCODED_PASS) {
        setAuth({
            nick: user,
            name: HARDCODED_NAME,
            cpf: HARDCODED_CPF,
            email: HARDCODED_EMAIL,
            senha: pass,
            distribuidora: HARDCODED_DISTRIBUIDORA,
        });
        goToEvents();
    } else {
        errorMessage.value = t('login.errorInvalid');
    }
}

function goToEvents(): void {
    navigateTo?.(Events, { frame: 'root-frame', clearHistory: true });
}

onMounted(() => {
    if (getAuth()) {
        setTimeout(() => goToEvents(), 0);
    }
});

const HARDCODED_USER = 'leo';
const HARDCODED_PASS = '123';
const HARDCODED_NAME = 'Leonardo Vasconcelos';
const HARDCODED_CPF = '12345678901';
const HARDCODED_EMAIL = 'leo@example.com';
const HARDCODED_DISTRIBUIDORA = 'Distribuidora Exemplo';
</script>
