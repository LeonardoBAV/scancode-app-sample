<template>
    <Page>
        <ActionBar title="Profile">
            <NavigationButton text="Back" android.systemIcon="ic_menu_back" @tap="goBack" />
        </ActionBar>

        <ScrollView>
            <StackLayout class="p-4">
                <Label :text="userName" class="text-xl font-bold text-gray-900 mb-2" />
                <StackLayout v-if="distributorName !== '—'" class="mb-4">
                    <Label text="Distributor" class="text-xs text-gray-500" />
                    <Label :text="distributorName" class="text-base text-gray-700" />
                </StackLayout>
                <Label text="Profile menu" class="text-sm text-gray-500 mb-3" />

                <Button text="Profile details" class="bg-gray-600 text-white p-3 rounded-lg mb-3" @tap="goToProfileDetails" />

                <!-- Registrations -->
                <Label text="Registrations" class="text-sm font-semibold text-gray-600 mb-2" />
                <Button text="Client list" class="bg-gray-600 text-white p-3 rounded-lg mb-3" @tap="onClientList" />
                <Button text="Product list" class="bg-gray-600 text-white p-3 rounded-lg mb-3" @tap="onProductList" />
                <Button text="Payment method list" class="bg-gray-600 text-white p-3 rounded-lg mb-4" @tap="onPaymentMethodList" />
                <Button text="Sync" class="bg-green-600 text-white p-3 rounded-lg mb-3" @tap="onSync" />

                <!-- Log out -->
                <Label text="Log out" class="text-sm font-semibold text-gray-600 mb-2" />
                <Button text="Log out" class="bg-red-500 text-white p-3 rounded-lg" @tap="logout" />
            </StackLayout>
        </ScrollView>
    </Page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, getCurrentInstance } from 'vue';
import { Dialogs } from '@nativescript/core';
import { getAuth, clearAuth } from '../../utils/auth';
import ProfileDetails from './ProfileDetails.vue';
import ClientListPage from './ClientListPage.vue';
import ProductListPage from './ProductListPage.vue';
import PaymentMethodListPage from './PaymentMethodListPage.vue';
import LoginPage from '../LoginPage.vue';

const profile = ref<ReturnType<typeof getAuth>>(null);
const userName = computed(() => profile.value?.name ?? profile.value?.nick ?? 'User');
const distributorName = computed(() => profile.value?.distribuidora ?? '—');

onMounted(() => {
    profile.value = getAuth();
});

const instance = getCurrentInstance();
const globals = instance?.appContext.config.globalProperties;
const navigateTo = globals?.$navigateTo as (target: unknown, options?: Record<string, unknown>) => void;
const navigateBack = globals?.$navigateBack as () => Promise<void> | void;

function goBack(): void {
    navigateBack?.();
}

function goToProfileDetails(): void {
    navigateTo?.(ProfileDetails);
}

function onSync(): void {
    Dialogs.alert({ title: 'Sync', message: 'Sync coming soon.', okButtonText: 'OK' });
}

function onClientList(): void {
    navigateTo?.(ClientListPage);
}

function onProductList(): void {
    navigateTo?.(ProductListPage);
}

function onPaymentMethodList(): void {
    navigateTo?.(PaymentMethodListPage);
}

function logout(): void {
    clearAuth();
    navigateTo?.(LoginPage, { frame: 'root-frame', clearHistory: true });
}
</script>
