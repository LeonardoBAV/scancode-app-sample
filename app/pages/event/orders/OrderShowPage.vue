<template>
    <Page actionBarHidden="true">
        <GridLayout rows="auto, *, auto" class="bg-background">
            <!-- Header -->
            <StackLayout row="0" class="bg-primary px-4 pt-4 pb-4">
                <GridLayout rows="auto" columns="auto, *, auto" verticalAlignment="center">
                    <Label col="0" :text="lucide('receipt')" class="lucide text-2xl text-primary-foreground mr-3" verticalAlignment="center" />
                    <Label col="1" :text="orderId" class="text-xl font-bold text-primary-foreground" verticalAlignment="center" />
                    <Label col="2" :text="orderStatus === 'Open' ? $t('pages.orderShow.statusOpen') : $t('pages.orderShow.statusCompleted')" :class="orderStatus === 'Open' ? 'badge-success' : 'badge-secondary'" verticalAlignment="center" />
                </GridLayout>
            </StackLayout>

            <!-- Content -->
            <ScrollView row="1">
                <StackLayout class="px-4 py-4 pb-8">
                    <!-- Values -->
                    <GridLayout rows="auto" columns="*, *" class="card mb-4" androidElevation="2" columnSpacing="20">
                        <StackLayout col="0">
                            <Label :text="$t('pages.orderShow.orderValue')" class="text-xs text-muted-foreground mb-1" />
                            <Label :text="displayOrderValue" class="text-2xl font-bold text-success" />
                        </StackLayout>
                        <StackLayout col="1">
                            <Label :text="$t('pages.orderShow.totalItems')" class="text-xs text-muted-foreground mb-1" />
                            <Label :text="displayTotalItems" class="text-2xl font-bold text-foreground" />
                        </StackLayout>
                    </GridLayout>

                    <!-- Client -->
                    <StackLayout class="card mb-4" androidElevation="2">
                        <GridLayout columns="auto, *, auto" class="mb-3">
                            <Label col="0" :text="lucide('circle-user')" class="lucide text-muted-foreground mr-3" verticalAlignment="center" />
                            <Label col="1" :text="$t('pages.orderShow.client')" class="text-sm font-medium text-muted-foreground" verticalAlignment="center" />
                            <Button col="2" :text="lucide('eye')" class="lucide btn-icon-sm bg-secondary text-secondary-foreground" @tap="goToClientShow" />
                        </GridLayout>
                        <Label :text="clientFantasyName || '—'" class="text-lg font-semibold text-card-foreground mb-2" textWrap="true" />
                        <Label :text="buyerName ? ($t('pages.orderShow.buyer') + ': ' + buyerName) : '—'" class="text-sm text-muted-foreground" textWrap="true" />
                    </StackLayout>

                    <!-- Payment -->
                    <StackLayout class="card mb-4" androidElevation="2">
                        <GridLayout columns="auto, *, auto" class="mb-3">
                            <Label col="0" :text="lucide('credit-card')" class="lucide text-muted-foreground mr-3" verticalAlignment="center" />
                            <Label col="1" :text="$t('pages.orderShow.paymentMethod')" class="text-sm font-medium text-muted-foreground" verticalAlignment="center" />
                            <Button col="2" :text="lucide('pencil')" class="lucide btn-icon-sm bg-secondary text-secondary-foreground" @tap="goToPayment" />
                        </GridLayout>
                        <Label :text="paymentMethodName || '—'" class="text-lg font-semibold text-card-foreground" textWrap="true" />
                    </StackLayout>

                    <!-- Observation -->
                    <StackLayout class="card" androidElevation="2">
                        <GridLayout columns="auto, *" class="mb-3">
                            <Label col="0" :text="lucide('clipboard-list')" class="lucide text-muted-foreground mr-3" verticalAlignment="center" />
                            <Label col="1" :text="$t('pages.orderShow.observation')" class="text-sm font-medium text-muted-foreground" verticalAlignment="center" />
                        </GridLayout>
                        <TextView v-model="observation" :hint="$t('pages.orderShow.observationHint')" class="input-field" height="100" />
                    </StackLayout>
                </StackLayout>
            </ScrollView>

            <!-- Footer -->
            <GridLayout v-if="orderStatus === 'Open'" row="2" rows="auto" columns="*, *" class="footer-bar" columnSpacing="12">
                <Button row="0" col="0" :text="$t('pages.orderShow.finish')" class="btn-primary" @tap="onFinish" />
                <Button row="0" col="1" :text="lucide('printer')" class="lucide btn-secondary" @tap="onPrint" />
            </GridLayout>
            <GridLayout v-else row="2" rows="auto" columns="*, auto" class="footer-bar">
                <Button row="0" col="1" :text="lucide('printer')" class="lucide btn-icon bg-secondary text-secondary-foreground" @tap="onPrint" />
            </GridLayout>
        </GridLayout>
    </Page>
</template>

<script setup lang="ts">
// --- Imports ---
import { orderCreateClientFantasyName, orderCreateBuyerName } from './order-create-state';
import { ref, computed, getCurrentInstance, type Ref, type ComputedRef } from 'vue';
import { formatCurrencyBR } from '../../../utils/format';
import { lucide } from '../../../utils/icons';
import OrderClientShowPage from './OrderClientShowPage.vue';
import OrderPaymentPage from './OrderPaymentPage.vue';
import OrderSignPage from './OrderSignPage.vue';

// --- Component logic ---
const displayOrderValue: string = formatCurrencyBR(1250);
const displayTotalItems: string = '5 itens';
const instance = getCurrentInstance();
const globals = instance?.appContext.config.globalProperties;
const navigateTo = globals?.$navigateTo as (target: unknown, options?: Record<string, unknown>) => void;

const orderId: Ref<string> = ref('ORD-NEW');
const observation: Ref<string> = ref('');
const orderStatus: Ref<'Open' | 'Completed'> = ref('Open');
const paymentMethodName: Ref<string> = ref('PIX');

const clientFantasyName: ComputedRef<string> = computed(() => orderCreateClientFantasyName.value);
const buyerName: ComputedRef<string> = computed(() => orderCreateBuyerName.value);


function goToPayment(): void {
    navigateTo?.(OrderPaymentPage);
}

function goToClientShow(): void {
    navigateTo?.(OrderClientShowPage);
}

function onPrint(): void {
    console.log('Print tapped');
}

function onFinish(): void {
    navigateTo?.(OrderSignPage);
}
</script>
