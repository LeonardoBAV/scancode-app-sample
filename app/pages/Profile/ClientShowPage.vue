<template>
    <Page actionBarHidden="true">
        <GridLayout rows="*" columns="*" class="bg-background">
            <GridLayout row="0" col="0" rows="auto, auto, *" class="bg-background">
                <HeaderComponent row="0" :title="headerTitle" :showAvatar="false" />

                <CustomSegmentedBarComponent v-model="selectedSegment" row="1" class="mx-4 mt-2 mb-2" />

                <ScrollView row="2">
                    <ClientInfoComponent v-if="selectedSegment === 0" :client="localClient" />
                    <ClientFormComponent v-else :client="localClient" @save="onClientFormSave" />
                </ScrollView>
            </GridLayout>

            <ToastHostComponent row="0" col="0" verticalAlignment="bottom" horizontalAlignment="stretch" />
        </GridLayout>
    </Page>
</template>

<script setup lang="ts">
// --- Imports ---
import type { ClientFormSubmitPayload } from '../../components/ClientFormComponent.vue';
import { computed, ref, watch, type ComputedRef, type Ref } from 'vue';
import { ClientsComposable } from '../../composables/clients-composable';
import { ClientsRepository } from '../../db/repositories/clients.repo';
import { showToast } from '../../composables/toast-state';
import { useTranslation } from '../../composables/useTranslation';
import { vibrateSuccess } from '../../utils/haptics';
import type { Client } from '../../types/schema/client';
import CustomSegmentedBarComponent from '../../components/CustomSegmentedBarComponent.vue';
import ToastHostComponent from '../../components/ToastHostComponent.vue';
import ClientFormComponent from '../../components/ClientFormComponent.vue';
import ClientInfoComponent from '../../components/ClientInfoComponent.vue';
import HeaderComponent from '../../components/HeaderComponent.vue';


// --- Component logic ---
const props = defineProps<{
    client: Client;
}>();

const { t } = useTranslation();

const selectedSegment: Ref<number> = ref(0);
const localClient: Ref<Client> = ref(props.client);

watch(
    () => props.client,
    (c: Client) => {
        localClient.value = c;
    },
    { immediate: true },
);

const headerTitle: ComputedRef<string> = computed(() => {
    const name: string | undefined = localClient.value?.fantasy_name?.trim();
    if (name) {
        return name;
    }
    return t('pages.clientShow.title');
});

async function onClientFormSave(payload: ClientFormSubmitPayload): Promise<void> {
    const next: Client = {
        ...localClient.value,
        fantasy_name: payload.fantasy_name,
        corporate_name: payload.corporate_name,
        cpf_cnpj: payload.cpf_cnpj,
        email: payload.email,
        phone: payload.phone,
        carrier: payload.carrier,
        updated_at: new Date().toISOString(),
    };
    try {
        await ClientsRepository.upsertOne(next);
        localClient.value = next;
        await ClientsComposable.refresh();
        vibrateSuccess();
        showToast({
            message: t('pages.clientForm.saveSuccess'),
            variant: 'success',
        });
        selectedSegment.value = 0;
    } catch (e: unknown) {
        console.error('[ClientShowPage] save failed:', e);
        showToast({
            message: t('pages.clientForm.saveError'),
            variant: 'error',
        });
    }
}
</script>
