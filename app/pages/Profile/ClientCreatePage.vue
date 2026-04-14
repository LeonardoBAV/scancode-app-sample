<template>
    <Page actionBarHidden="true">
        <GridLayout rows="*" columns="*" class="bg-background">
            <GridLayout row="0" col="0" rows="auto, *" class="bg-background">
                <HeaderComponent row="0" :title="$t('pages.clientCreate.title')" :showAvatar="false" />

                <ClientFormComponent v-if="draftClient" row="1" :client="draftClient" @save="onClientFormSave" />
            </GridLayout>

            <ToastHostComponent row="0" col="0" verticalAlignment="bottom" horizontalAlignment="stretch" />
        </GridLayout>
    </Page>
</template>

<script setup lang="ts">
// --- Imports ---
import { onMounted, ref, type Ref } from 'vue';
import { ClientsRepository } from '../../db/repositories/clients.repo';
import { showToast } from '../../composables/toast-state';
import { useTranslation } from '../../composables/useTranslation';
import { useNavigation } from '../../composables/useNavigation';
import { vibrateSuccess } from '../../utils/haptics';
import type { Client } from '../../types/schema/client';
import ToastHostComponent from '../../components/ToastHostComponent.vue';
import ClientFormComponent from '../../components/ClientFormComponent.vue';
import HeaderComponent from '../../components/HeaderComponent.vue';


// --- Component logic ---
const { t } = useTranslation();
const { navigateBack } = useNavigation();

const draftClient: Ref<Client | null> = ref<Client | null>(null);

onMounted(async () => {
    try {
        const nextId: number = await ClientsRepository.getNextLocalClientId();
        const now: string = new Date().toISOString();
        draftClient.value = {
            id: nextId,
            remote_id: nextId,
            is_sync: false,
            cpf_cnpj: '',
            corporate_name: '',
            fantasy_name: '',
            email: '',
            phone: '',
            carrier: '',
            created_at: now,
            updated_at: now,
        };
    } catch (e: unknown) {
        console.error('[ClientCreatePage] init draft failed:', e);
        showToast({
            message: t('pages.clientCreate.initError'),
            variant: 'error',
        });
    }
});

async function onClientFormSave(client: Client): Promise<void> {
    try {
        await ClientsRepository.upsertOne(client);
        vibrateSuccess();
        showToast({
            message: t('pages.clientForm.saveSuccess'),
            variant: 'success',
        });
        navigateBack();
    } catch (e: unknown) {
        console.error('[ClientCreatePage] save failed:', e);
        showToast({
            message: t('pages.clientForm.saveError'),
            variant: 'error',
        });
    }
}
</script>
