<template>
    <Page actionBarHidden="true">
        <GridLayout rows="*" columns="*" class="bg-background">
            <GridLayout row="0" col="0" rows="auto, auto, *" class="bg-background">
                <HeaderComponent row="0" :title="headerTitle" :showAvatar="false" />

                <CustomSegmentedBarComponent v-model="selectedSegment" row="1" class="mx-4 mt-2 mb-2" />

                <ScrollView row="2">
                    <ClientInfoComponent v-if="selectedSegment === 0" :client="clientPage" />
                    <ClientFormComponent v-else :client="clientPage" @save="updateClient" />
                </ScrollView>
            </GridLayout>

            <ToastHostComponent row="0" col="0" verticalAlignment="bottom" horizontalAlignment="stretch" />
        </GridLayout>
    </Page>
</template>

<script setup lang="ts">
// --- Imports ---
import { computed, ref, watch, type ComputedRef, type Ref } from 'vue';
import { ClientsRepository } from '../../db/repositories/clients.repo';
import { showToast } from '../../composables/toast-state';
import { useTranslation } from '../../composables/useTranslation';
import { Haptics } from '../../utils/haptics';
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
const clientPage: Ref<Client> = ref(props.client);

watch(
    () => props.client,
    (client: Client) => {
        clientPage.value = client;
    },
    { immediate: true },
);

const headerTitle: ComputedRef<string> = computed(() => {
    return clientPage.value.fantasy_name;
});

async function updateClient(client: Client): Promise<void> {
    try {
        clientPage.value = await ClientsRepository.upsertOne(client);
        Haptics.vibrateSuccess();
        showToast({
            message: t('pages.clientForm.saveSuccess'),
            variant: 'success',
        });
        selectedSegment.value = 0;
    } catch (e: unknown) {
        console.error('[ClientShowPage] update client failed:', e);
        showToast({
            message: t('pages.clientForm.saveError'),
            variant: 'error',
        });
    }
}
</script>
