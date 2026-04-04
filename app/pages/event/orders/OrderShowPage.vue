<template>
    <Page actionBarHidden="true">
        <GridLayout rows="auto, *, auto" class="bg-background">

            <HeaderComponent row="0" :title="orderId" />

            <!-- Content -->
            <ScrollView row="1">
                <StackLayout>
                    <!-- Hero: Values (dark) -->
                    <StackLayout class="bg-primary p-4 py-6">
                        <GridLayout rows="auto" columns="*, *">
                            <StackLayout col="0" class="mr-4" horizontalAlignment="center" verticalAlignment="center">
                                <Label :text="$t('pages.orderShow.orderValue')" class="text-xs text-primary-foreground opacity-80 mb-1" />
                                <Label :text="displayOrderValue" class="text-2xl font-bold text-success" />
                            </StackLayout>
                            <StackLayout col="1" class="ml-4" horizontalAlignment="center" verticalAlignment="center">
                                <Label :text="$t('pages.orderShow.totalItems')" class="text-xs text-primary-foreground opacity-80 mb-1" />
                                <Label :text="displayTotalItems" class="text-2xl font-bold text-primary-foreground" />
                            </StackLayout>
                        </GridLayout>
                    </StackLayout>

                    <!-- Client -->
                    <StackLayout class="px-4 pt-4 pb-8">
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
                </StackLayout>
            </ScrollView>

            <!-- Footer -->
            <StackLayout row="2" class="footer-bar">
                <GridLayout rows="auto" columns="*, *" class="mb-3" verticalAlignment="center">
                    <Label col="0" :text="orderStatus === 'Open' ? $t('pages.orderShow.statusOpen') : $t('pages.orderShow.statusCompleted')" :class="(orderStatus === 'Open' ? 'badge-success' : 'badge-secondary') + ' mr-2'" verticalAlignment="center" horizontalAlignment="center" />
                    <GridLayout col="1" columns="auto, *" class="ml-2" verticalAlignment="center" horizontalAlignment="center">
                        <Label col="0" :text="synced ? lucide('circle-check') : lucide('clock')" :class="(synced ? 'lucide text-success' : 'lucide text-warning') + ' mr-2'" verticalAlignment="center" />
                        <Label col="1" :text="synced ? $t('pages.orderList.synced') : $t('pages.orderList.notSynced')" class="text-sm" :class="synced ? 'text-success' : 'text-warning'" verticalAlignment="center" />
                    </GridLayout>
                </GridLayout>
                <GridLayout v-if="orderStatus === 'Open'" rows="auto" columns="*, *" columnSpacing="12">
                    <Button row="0" col="0" :text="$t('pages.orderShow.signature')" class="btn-primary" @tap="onFinish" />
                    <Button row="0" col="1" :text="lucide('printer')" class="lucide btn-secondary" @tap="onPrint" />
                </GridLayout>
                <GridLayout v-else rows="auto" columns="*, auto">
                    <Button row="0" col="1" :text="lucide('printer')" class="lucide btn-icon bg-secondary text-secondary-foreground" @tap="onPrint" />
                </GridLayout>
            </StackLayout>
        </GridLayout>
    </Page>
</template>

<script setup lang="ts">
// --- Imports ---
import { orderCreateClientFantasyName, orderCreateBuyerName } from './order-create-state';
import { ref, computed, type ComputedRef, type Ref } from 'vue';
import { formatCurrencyBR } from '../../../utils/format';
import { lucide } from '../../../utils/icons';
import { useNavigation } from '../../../composables/useNavigation';
import HeaderComponent from '../../../components/HeaderComponent.vue';
import OrderClientShowPage from './OrderClientShowPage.vue';
import OrderPaymentPage from './OrderPaymentPage.vue';
import OrderSignPage from './OrderSignPage.vue';


// --- Component logic ---
const props = withDefaults(
    defineProps<{
        orderId?: string;
    }>(),
    { orderId: undefined },
);

const displayOrderValue: string = formatCurrencyBR(1250);
const displayTotalItems: string = '5 itens';
const { navigateTo } = useNavigation();

const orderId: Ref<string> = ref(props.orderId ?? 'ORD-NEW');
const observation: Ref<string> = ref('');
const orderStatus: Ref<'Open' | 'Completed'> = ref('Open');
const synced: Ref<boolean> = ref(false);
const paymentMethodName: Ref<string> = ref('PIX');

const clientFantasyName: ComputedRef<string> = computed(() => orderCreateClientFantasyName.value);
const buyerName: ComputedRef<string> = computed(() => orderCreateBuyerName.value);


function goToPayment(): void {
    navigateTo(OrderPaymentPage);
}

function goToClientShow(): void {
    navigateTo(OrderClientShowPage);
}

function onPrint(): void {
    console.log('Print tapped');
}

function onFinish(): void {
    navigateTo(OrderSignPage);
}
</script>
