<template>
    <Page actionBarHidden="true">
        <GridLayout rows="auto, *, auto" class="bg-background">
            <HeaderComponent row="0" :title="$t('pages.orderSelectClient.title')" />

            <ClientListComponent row="1" :clients="clients" :selected-client-id="selectedClient?.id ?? null" @select="onSelectClient" />

            <StackLayout row="2" class="footer-bar">
                <Button :text="$t('pages.orderSelectClient.confirm')" :class="selectedClient ? 'btn-primary' : 'btn-primary opacity-50'" :isEnabled="!!selectedClient" @tap="onConfirm" />
            </StackLayout>
        </GridLayout>
    </Page>
</template>

<script setup lang="ts">
// --- Imports ---
import { computed, ref, type ComputedRef, type Ref } from 'vue';
import type { Client } from '../../../types/schema/client';
import { ClientsComposable } from '../../../composables/clients-composable';
import { useNavigation } from '../../../composables/useNavigation';
import { useCurrentEvent } from '../../../composables/repository/useCurrentEvent';
import { useCurrentOrder } from '../../../composables/repository/useCurrentOrder';
import { OrdersRepository } from '../../../db/repositories/orders.repo';
import ClientListComponent from '../../../components/ClientListComponent.vue';
import HeaderComponent from '../../../components/HeaderComponent.vue';
import OrderShowPage from './OrderShowPage.vue';


// --- Component logic ---
const props = withDefaults(
    defineProps<{
        targetPage: 'back' | 'OrderShowPage';
        orderId?: string;
    }>(),
    { targetPage: 'OrderShowPage', orderId: undefined },
);

const { navigateTo, navigateBack } = useNavigation();

const clientsFromStore = ClientsComposable.getList();

const clients: ComputedRef<Client[]> = computed(() =>
    clientsFromStore.value.map((client: Client): Client => ({
        ...client,
        fantasy_name: client.fantasy_name.trim() !== '' ? client.fantasy_name : client.corporate_name,
    })),
);

const selectedClient: Ref<Client | null> = ref(null);

function onSelectClient(client: Client): void {
    selectedClient.value = selectedClient.value?.id === client.id ? null : client;
}

function onClientConfirmed(): void {
    if (props.targetPage === 'back') {
        void navigateBack();
    } else {
        navigateTo(OrderShowPage, props.orderId ? { props: { orderId: props.orderId } } : undefined);
    }
}

async function onConfirm(): Promise<void> {
    if (!selectedClient.value) return;

    // When coming from "New order" flow (no orderId), create the order first.
    if (props.targetPage === 'OrderShowPage' && !props.orderId) {
        const eventId: number | undefined = useCurrentEvent.getEvent().value?.id;
        const clientId: number | null | undefined = selectedClient.value.id;

        const created = await OrdersRepository.createOne({
            event_id: eventId as number,
            client_id: clientId as number,
            sales_representative_id: 0,
            payment_method_id: null,
            status: 'Open',
            notes: null,
        });

        await useCurrentOrder.setOrder(created.id as number);
        navigateTo(OrderShowPage, { props: { orderId: String(created.id) } });
    }

    onClientConfirmed();
}
</script>
