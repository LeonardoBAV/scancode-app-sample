<template>
    <Page actionBarHidden="true">
        <GridLayout rows="*" columns="*" class="bg-background">
            <GridLayout row="0" col="0" rows="auto, *" class="bg-background">
                <HeaderComponent row="0" :title="$t('pages.clientCreate.title')" :showAvatar="false" />

                <ClientFormComponent row="1" :client="clientDraft" @save="createClient" />
            </GridLayout>

            <ToastHostComponent row="0" col="0" verticalAlignment="bottom" horizontalAlignment="stretch" />
        </GridLayout>
    </Page>
</template>

<script setup lang="ts">
// --- Imports ---
import { ref, type Ref } from 'vue';
import { ClientsRepository } from '../../db/repositories/clients.repo';
import { showToast } from '../../composables/toast-state';
import { useTranslation } from '../../composables/useTranslation';
import { useNavigation } from '../../composables/useNavigation';
import type { Client } from '../../types/schema/client';
import ToastHostComponent from '../../components/ToastHostComponent.vue';
import ClientFormComponent from '../../components/ClientFormComponent.vue';
import HeaderComponent from '../../components/HeaderComponent.vue';


// --- Component logic ---
const { t } = useTranslation();
const { navigateBack } = useNavigation();

const clientDraft: Ref<Client> = ref<Client>({
    id: null,
    remote_id: null,
    is_sync: false,
    cpf_cnpj: '',
    corporate_name: '',
    fantasy_name: '',
    email: '',
    phone: '',
    carrier: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
});

async function createClient(client: Client): Promise<void> {
    try {
        await ClientsRepository.upsertOne(client);
        showToast({
            message: t('pages.clientForm.saveSuccess'),
            variant: 'success',
        });
        navigateBack();
    } catch (e: unknown) {
        console.error('[ClientCreatePage] create client failed:', e);
        showToast({
            message: t('pages.clientForm.saveError'),
            variant: 'error',
        });
    }
}
</script>
