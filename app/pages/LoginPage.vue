<template>
    <Page actionBarHidden="true">
        <GridLayout rows="2*, auto, 3*" class="bg-background p-8">

            <!-- Branding -->
            <StackLayout row="0" verticalAlignment="bottom" class="mb-10">
                <Label text="OY" class="text-xl font-bold text-primary-foreground bg-primary w-16 h-16 rounded-full text-center" horizontalAlignment="center" verticalAlignment="center" />
                <Label :text="$t('pages.login.title')" class="text-2xl font-bold text-foreground text-center mt-4" />
                <Label :text="$t('pages.login.subtitle')" class="text-sm text-muted-foreground text-center mt-1" />
            </StackLayout>

            <!-- Form -->
            <StackLayout row="1">
                <StackLayout class="mb-4">
                    <Label :text="$t('pages.login.cpf')" class="text-sm font-medium text-foreground mb-1" />
                    <TextField v-model="cpf" :hint="$t('pages.login.cpfPlaceholder')" keyboardType="number" class="input-field" placeholderColor="#a1a1aa" autocorrect="false" autocapitalizationType="none" :isEnabled="!isLoading" />
                </StackLayout>

                <StackLayout class="mb-5">
                    <Label :text="$t('pages.login.password')" class="text-sm font-medium text-foreground mb-1" />
                    <TextField v-model="password" :hint="$t('pages.login.passwordPlaceholder')" :secure="true" class="input-field" placeholderColor="#a1a1aa" :isEnabled="!isLoading" />
                </StackLayout>

                <Label v-if="errorMessage" :text="errorMessage" class="text-sm text-destructive text-center mb-3" textWrap="true" />
                <Label v-if="syncStatus" :text="syncStatus" class="text-sm text-muted-foreground text-center mb-3" textWrap="true" />

                <Button :text="buttonLabel" :class="isLoading ? 'btn-primary text-lg p-4 opacity-50' : 'btn-primary text-lg p-4'" :isEnabled="!isLoading" @tap="onLogin" />
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
// --- Imports ---
import { ref, onMounted, type Ref } from 'vue';
import { login } from '../integrations/adapters/scancode-adapter';
import { SyncPullService } from '../sync/sync-pull-service';
import { getAuth, setAuth } from '../persistence/auth-session';
import { useTranslation } from '../composables/useTranslation';
import { useNavigation } from '../composables/useNavigation';
import { useAppVersion } from '../composables/useAppVersion';
import { ApiException } from '../types/exceptions/api-exception';
import EventsPage from './EventsPage.vue';


// --- Component logic ---
const { t } = useTranslation();
const { navigateTo } = useNavigation();
const appVersion: string = useAppVersion();

const cpf: Ref<string> = ref('');
const password: Ref<string> = ref('');
const errorMessage: Ref<string> = ref('');
const syncStatus: Ref<string> = ref('');
const isLoading: Ref<boolean> = ref(false);
const isSyncing: Ref<boolean> = ref(false);

const buttonLabel: Ref<string> = ref(t('pages.login.submit'));

async function onLogin(): Promise<void> {
    errorMessage.value = '';
    syncStatus.value = '';
    const cpfValue: string = cpf.value.trim();
    const passValue: string = password.value;

    if (!cpfValue || !passValue) {
        errorMessage.value = t('pages.login.errorInvalid');
        return;
    }

    isLoading.value = true;
    buttonLabel.value = t('pages.login.submitting');

    try {
        const response = await login(cpfValue, passValue);
        setAuth(response);

        isSyncing.value = true;
        buttonLabel.value = t('pages.login.syncing');
        syncStatus.value = t('pages.login.syncingEvents');

        await SyncPullService.refreshAllEntities();

        syncStatus.value = '';
        goToEvents();
    } catch (err: unknown) {
        if (isSyncing.value) {
            syncStatus.value = '';
            goToEvents();
        } else {
            errorMessage.value = (err as ApiException).message;
        }
    } finally {
        isLoading.value = false;
        isSyncing.value = false;
        buttonLabel.value = t('pages.login.submit');
    }
}

function goToEvents(): void {
    navigateTo(EventsPage, { frame: 'root-frame', clearHistory: true });
}

onMounted(() => {
    if (getAuth()) {
        setTimeout(() => goToEvents(), 0);
    }
});
</script>
