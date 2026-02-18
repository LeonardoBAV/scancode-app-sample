<template>
    <Page actionBarHidden="true">
        <GridLayout rows="*" columns="*">
            <ListView row="0" col="0" :items="orders" separatorColor="transparent" class="list">
                <template #default="{ item }">
                    <GridLayout rows="auto, auto, auto" columns="*, auto" class="order-item p-3 m-2 rounded-lg border border-gray-200" @tap="onOrderTap(item)">
                        <Label row="0" col="0" :text="item.clientCompanyName" class="text-base font-bold text-gray-900" textWrap="true" />
                        <Label row="0" col="1" :text="item.id" class="text-xs text-gray-500" horizontalAlignment="right" />
                        <Label row="1" col="0" :text="item.itemCount + ' itens · ' + formatValor(item.totalValue)" class="text-sm text-gray-600 mt-1" />
                        <Label row="1" col="1" :text="statusLabel(item.status)" :class="'text-sm font-semibold ' + statusClass(item.status)" horizontalAlignment="right" />
                        <Label row="2" col="0" :text="item.synced ? 'Sync' : 'Not Sync'" :class="'text-sm mt-1 font-medium ' + (item.synced ? 'text-green-600' : 'text-amber-600')" />
                    </GridLayout>
                </template>
            </ListView>
            <Button
                row="0"
                col="0"
                text="+"
                class="fab-add-order"
                horizontalAlignment="right"
                verticalAlignment="bottom"
                @tap="onAddNewOrder"
            />
        </GridLayout>
    </Page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Order, OrderStatus } from '../../../types/order';

const orders = ref<Order[]>([
    { id: 'ORD-001', clientCompanyName: 'Empresa Alpha Ltda', status: 'Open', itemCount: 5, totalValue: 1250, synced: false },
    { id: 'ORD-002', clientCompanyName: 'Beta Comércio S.A.', status: 'Closed', itemCount: 12, totalValue: 3400, synced: true },
    { id: 'ORD-003', clientCompanyName: 'Gamma Serviços ME', status: 'Open', itemCount: 3, totalValue: 480, synced: false },
    { id: 'ORD-004', clientCompanyName: 'Delta Indústria Ltda', status: 'Canceled', itemCount: 0, totalValue: 0, synced: true },
    { id: 'ORD-005', clientCompanyName: 'Epsilon Solutions', status: 'Closed', itemCount: 8, totalValue: 2100, synced: true },
    { id: 'ORD-006', clientCompanyName: 'Zeta Distribuidora', status: 'Open', itemCount: 15, totalValue: 5200, synced: false },
    { id: 'ORD-007', clientCompanyName: 'Eta Logística S.A.', status: 'Closed', itemCount: 4, totalValue: 890, synced: true },
    { id: 'ORD-008', clientCompanyName: 'Theta Tech Ltda', status: 'Open', itemCount: 7, totalValue: 1650, synced: false },
    { id: 'ORD-009', clientCompanyName: 'Iota Alimentos ME', status: 'Closed', itemCount: 22, totalValue: 4100, synced: true },
    { id: 'ORD-010', clientCompanyName: 'Kappa Construção', status: 'Open', itemCount: 6, totalValue: 2800, synced: false },
    { id: 'ORD-011', clientCompanyName: 'Lambda Consultoria', status: 'Closed', itemCount: 2, totalValue: 650, synced: true },
]);

function formatValor(value: number): string {
    return value === 0 ? 'Grátis' : 'R$ ' + value.toLocaleString('pt-BR');
}

function statusLabel(status: OrderStatus): string {
    return status;
}

function statusClass(status: OrderStatus): string {
    switch (status) {
        case 'Open':
            return 'text-green-600';
        case 'Closed':
            return 'text-blue-600';
        case 'Canceled':
            return 'text-gray-500';
        default:
            return 'text-gray-600';
    }
}

function onOrderTap(order: Order): void {
    // Placeholder for navigation to order detail
}

function onAddNewOrder(): void {
    // Placeholder for starting a new order (add order flow)
    console.log('Add new order tapped');
}
</script>

<style scoped>
.order-item {
    background-color: #fafafa;
}

.fab-add-order {
    width: 56;
    height: 56;
    border-radius: 28;
    margin: 16;
    font-size: 28;
    font-weight: bold;
    background-color: #22c55e;
    color: white;
}
</style>
