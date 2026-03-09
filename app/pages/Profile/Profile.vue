<template>
    <Page actionBarHidden="true">
        <GridLayout rows="auto, *" class="bg-background">

            <HeaderComponent row="0" :title="$t('pages.profile.title')" :showAvatar="false" />

            <ScrollView row="1">
                <StackLayout class="pb-8">

                    <!-- User Hero Section -->
                    <StackLayout class="bg-primary pt-8 pb-6 px-4" horizontalAlignment="stretch">
                        <Label
                            :text="userInitials"
                            class="text-2xl font-bold text-foreground bg-card w-20 h-20 rounded-full text-center mb-4"
                            horizontalAlignment="center"
                        />
                        <Label :text="userName" class="text-xl font-bold text-primary-foreground text-center" />
                        <Label :text="userEmail" class="text-sm text-primary-foreground opacity-70 text-center mt-1" />
                        <Label
                            v-if="distributorName !== '—'"
                            :text="distributorName"
                            class="text-sm text-primary-foreground opacity-50 text-center mt-1"
                        />
                    </StackLayout>

                    <!-- Profile Details -->
                    <StackLayout class="px-4 mt-6">
                        <StackLayout class="card p-0" androidElevation="2">
                            <GridLayout columns="auto, *, auto" class="p-4" @tap="goToProfileDetails">
                                <Label col="0" :text="lucide('circle-user')" class="lucide text-muted-foreground mr-4" verticalAlignment="center" />
                                <Label col="1" :text="$t('pages.profile.details')" class="text-base text-card-foreground" verticalAlignment="center" />
                                <Label col="2" :text="lucide('chevron-right')" class="lucide text-muted-foreground" verticalAlignment="center" />
                            </GridLayout>
                        </StackLayout>
                    </StackLayout>

                    <!-- Registrations Group -->
                    <StackLayout class="px-4 mt-6">
                        <Label :text="$t('pages.profile.registrations')" class="text-xs font-semibold text-muted-foreground uppercase mb-2 px-1" />

                        <StackLayout class="card p-0" androidElevation="2">
                            <GridLayout columns="auto, *, auto" class="p-4" @tap="onClientList">
                                <Label col="0" :text="lucide('users')" class="lucide text-muted-foreground mr-4" verticalAlignment="center" />
                                <Label col="1" :text="$t('pages.profile.clientList')" class="text-base text-card-foreground" verticalAlignment="center" />
                                <Label col="2" :text="lucide('chevron-right')" class="lucide text-muted-foreground" verticalAlignment="center" />
                            </GridLayout>

                            <StackLayout class="bg-border mx-4" style="height: 1" />

                            <GridLayout columns="auto, *, auto" class="p-4" @tap="onProductList">
                                <Label col="0" :text="lucide('package')" class="lucide text-muted-foreground mr-4" verticalAlignment="center" />
                                <Label col="1" :text="$t('pages.profile.productList')" class="text-base text-card-foreground" verticalAlignment="center" />
                                <Label col="2" :text="lucide('chevron-right')" class="lucide text-muted-foreground" verticalAlignment="center" />
                            </GridLayout>

                            <StackLayout class="bg-border mx-4" style="height: 1" />

                            <GridLayout columns="auto, *, auto" class="p-4" @tap="onPaymentMethodList">
                                <Label col="0" :text="lucide('credit-card')" class="lucide text-muted-foreground mr-4" verticalAlignment="center" />
                                <Label col="1" :text="$t('pages.profile.paymentMethods')" class="text-base text-card-foreground" verticalAlignment="center" />
                                <Label col="2" :text="lucide('chevron-right')" class="lucide text-muted-foreground" verticalAlignment="center" />
                            </GridLayout>
                        </StackLayout>
                    </StackLayout>

                    <!-- Sync -->
                    <StackLayout class="px-4 mt-6">
                        <StackLayout class="card p-0" androidElevation="2">
                            <GridLayout columns="auto, *, auto" class="p-4" @tap="onSync">
                                <Label col="0" :text="lucide('refresh-cw')" class="lucide text-muted-foreground mr-4" verticalAlignment="center" />
                                <Label col="1" :text="$t('pages.profile.sync')" class="text-base text-card-foreground" verticalAlignment="center" />
                                <Label col="2" :text="lucide('chevron-right')" class="lucide text-muted-foreground" verticalAlignment="center" />
                            </GridLayout>
                        </StackLayout>
                    </StackLayout>

                    <!-- Logout (primary: fundo preto, fonte branca) -->
                    <StackLayout class="px-4 mt-6">
                        <StackLayout class="bg-primary border border-border rounded-lg p-0" androidElevation="1">
                            <GridLayout columns="auto, *" class="p-4" @tap="logout">
                                <Label col="0" :text="lucide('log-out')" class="lucide text-primary-foreground mr-4" verticalAlignment="center" />
                                <Label col="1" :text="$t('pages.profile.logout')" class="text-base font-semibold text-primary-foreground" verticalAlignment="center" />
                            </GridLayout>
                        </StackLayout>
                    </StackLayout>

                    <!-- Footer: versão do app -->
                    <StackLayout class="px-4 mt-8 pb-4">
                        <StackLayout class="separator" />
                        <Label :text="'v' + appVersion" class="text-xs text-muted-foreground text-center mt-2" />
                    </StackLayout>

                </StackLayout>
            </ScrollView>

        </GridLayout>
    </Page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, getCurrentInstance } from 'vue';
import { Dialogs } from '@nativescript/core';
import { useTranslation } from '../../composables/useTranslation';
import { useAppVersion } from '../../composables/useAppVersion';
import { getAuth, clearAuth } from '../../utils/auth';
import { lucide } from '../../utils/icons';
import HeaderComponent from '../../components/HeaderComponent.vue';
import ProfileDetails from './ProfileDetails.vue';
import ClientListPage from './ClientListPage.vue';
import ProductListPage from './ProductListPage.vue';
import PaymentMethodListPage from './PaymentMethodListPage.vue';
import LoginPage from '../LoginPage.vue';

const { t } = useTranslation();
const appVersion = useAppVersion();

const profile = ref<ReturnType<typeof getAuth>>(null);
const userName = computed(() => profile.value?.name ?? profile.value?.nick ?? 'User');
const userEmail = computed(() => profile.value?.email ?? '');
const distributorName = computed(() => profile.value?.distribuidora ?? '—');
const userInitials = computed(() => {
    const name = userName.value;
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
});

onMounted(() => {
    profile.value = getAuth();
});

const instance = getCurrentInstance();
const navigateTo = instance?.appContext.config.globalProperties.$navigateTo as (
    target: unknown,
    options?: Record<string, unknown>
) => void;

function goToProfileDetails(): void {
    navigateTo?.(ProfileDetails);
}

function onSync(): void {
    Dialogs.alert({ title: t('pages.profile.sync'), message: t('pages.profile.syncMessage'), okButtonText: 'OK' });
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
