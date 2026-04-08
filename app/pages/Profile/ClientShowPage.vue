<template>
    <Page actionBarHidden="true">
        <GridLayout rows="auto, auto, *" class="bg-background">
            <HeaderComponent row="0" :title="headerTitle" :showAvatar="false" />

            <CustomSegmentedBarComponent v-model="selectedSegment" row="1" class="mx-4 mt-2 mb-2" />

            <ScrollView row="2">
                <ClientInfoComponent v-if="selectedSegment === 0" :client="localClient" />
                <ClientFormComponent v-else row="2" :client="localClient" @save="onClientFormSave" />
            </ScrollView>

        </GridLayout>
    </Page>
</template>

<script setup lang="ts">
// --- Imports ---
import type { ClientFormSubmitPayload } from '../../components/ClientFormComponent.vue';
import { computed, ref, watch, type ComputedRef, type Ref } from 'vue';
import { ClientsComposable } from '../../composables/clients-composable';
import { ClientsRepository } from '../../db/repositories/clients.repo';
import { useTranslation } from '../../composables/useTranslation';
import { vibrateSuccess } from '../../utils/haptics';
import type { Client } from '../../types/schema/client';
import { Dialogs } from '@nativescript/core';
import CustomSegmentedBarComponent from '../../components/CustomSegmentedBarComponent.vue';
import ClientFormComponent from '../../components/ClientFormComponent.vue';
import ClientInfoComponent from '../../components/ClientInfoComponent.vue';
import HeaderComponent from '../../components/HeaderComponent.vue';


// --- Component logic ---
const props = defineProps<{
    client: Client | null;
}>();

const { t } = useTranslation();

const selectedSegment: Ref<number> = ref(0);
const localClient: Ref<Client | null> = ref(null);

watch(
    () => props.client,
    (c: Client | null) => {
        localClient.value = c ? { ...c } : null;
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
    if (!localClient.value) {
        await Dialogs.alert({
            title: t('common.error'),
            message: t('pages.clientForm.saveErrorNoClient'),
            okButtonText: t('common.done'),
        });
        return;
    }
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
        await Dialogs.alert({
            message: t('pages.clientForm.saveSuccess'),
            okButtonText: t('common.done'),
        });
        selectedSegment.value = 0;
    } catch (e: unknown) {
        console.error('[ClientShowPage] save failed:', e);
        await Dialogs.alert({
            title: t('common.error'),
            message: t('pages.clientForm.saveError'),
            okButtonText: t('common.done'),
        });
    }
}
</script>
