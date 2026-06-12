<template>
    <Page actionBarHidden="true">
        <GridLayout rows="auto, *, auto" class="bg-background">
            <HeaderComponent row="0" :title="headerTitle" />
            <StackLayout v-if="loading" row="1" class="p-8" verticalAlignment="center" horizontalAlignment="center">
                <Label :text="$t('common.loading')" class="text-base text-muted-foreground text-center" textWrap="true" />
            </StackLayout>
            <StackLayout v-else-if="!eventDisplay" row="1" class="p-8" verticalAlignment="center" horizontalAlignment="center">
                <Label :text="$t('pages.eventHome.noEvent')" class="text-base text-muted-foreground text-center mb-4" textWrap="true" />
                <Button :text="$t('pages.eventHome.backToEvents')" class="btn-primary" @tap="goToEvents" />
            </StackLayout>
            <ScrollView v-else row="1">
                <StackLayout class="p-4 pb-8">


                    <!-- Summary Card -->
                    <StackLayout class="card p-0">

                        <!-- Status + Date -->
                        <GridLayout columns="*, auto" class="p-4">
                            <StackLayout col="0">
                                <Label :text="$t('pages.eventHome.status')" class="text-xs text-muted-foreground mb-1" />
                                <Label :text="statusLabel(eventDisplay.status)" :class="statusBadgeClass(eventDisplay.status)" horizontalAlignment="left" />
                            </StackLayout>
                            <StackLayout col="1" horizontalAlignment="right">
                                <Label :text="$t('pages.eventHome.date')" class="text-xs text-muted-foreground mb-1 text-right" />
                                <Label :text="eventDisplay.startDate + ' — ' + eventDisplay.endDate" class="text-sm text-card-foreground text-right" />
                            </StackLayout>
                        </GridLayout>

                        <StackLayout class="bg-border mx-4" style="height: 1" />

                        <!-- Total -->
                        <GridLayout columns="auto, *, auto" class="p-4">
                            <Label col="0" :text="Icons.lucide('wallet')" class="lucide text-muted-foreground mr-4" verticalAlignment="center" />
                            <Label col="1" :text="$t('pages.eventHome.totalValue')" class="text-base text-card-foreground" verticalAlignment="center" />
                            <Label col="2" :text="Format.formatCurrencyBR(eventDisplay.totalValue)" class="text-lg font-bold text-success" verticalAlignment="center" />
                        </GridLayout>

                    </StackLayout>

                    <!-- Orders Card -->
                    <Label :text="$t('pages.eventHome.ordersSection')" class="text-xs font-semibold text-muted-foreground uppercase mt-6 mb-2 px-1" />

                    <StackLayout class="card p-0">

                        <!-- Total Orders -->
                        <GridLayout columns="auto, *, auto" class="p-4">
                            <Label col="0" :text="Icons.lucide('receipt')" class="lucide text-muted-foreground mr-4" verticalAlignment="center" />
                            <Label col="1" :text="$t('pages.eventHome.orders')" class="text-base text-card-foreground" verticalAlignment="center" />
                            <Label col="2" :text="String(eventDisplay.orderCount)" class="text-base font-semibold text-card-foreground" verticalAlignment="center" />
                        </GridLayout>

                        <StackLayout class="bg-border mx-4" style="height: 1" />

                        <!-- Synced -->
                        <GridLayout columns="auto, *, auto" class="p-4">
                            <Label col="0" :text="Icons.lucide('circle-check')" class="lucide text-success mr-4" verticalAlignment="center" />
                            <Label col="1" :text="$t('pages.eventHome.synced')" class="text-base text-card-foreground" verticalAlignment="center" />
                            <Label col="2" :text="String(eventDisplay.ordersSynced)" class="text-base font-semibold text-success" verticalAlignment="center" />
                        </GridLayout>

                        <StackLayout class="bg-border mx-4" style="height: 1" />

                        <!-- Unsynced -->
                        <GridLayout columns="auto, *, auto" class="p-4">
                            <Label col="0" :text="Icons.lucide('clock')" class="lucide text-warning mr-4" verticalAlignment="center" />
                            <Label col="1" :text="$t('pages.eventHome.unsynced')" class="text-base text-card-foreground" verticalAlignment="center" />
                            <Label col="2" :text="String(eventDisplay.ordersUnsynced)" class="text-base font-semibold text-warning" verticalAlignment="center" />
                        </GridLayout>

                    </StackLayout>
                    <StackLayout v-if="isScancodeDesktopIntegrationRequired" class="mt-3">
                        <Button
                            v-if="!scancodeDesktopUrl"
                            :text="Icons.lucide('scan-barcode')"
                            class="lucide btn-primary"
                            :isEnabled="!isConnectingScancodeDesktop"
                            @tap="onScancodeDesktopTap"
                        />
                        <GridLayout v-else columns="auto, *" class="card p-4">
                            <Label col="0" :text="Icons.lucide('circle-check')" class="lucide text-success mr-4" verticalAlignment="center" />
                            <StackLayout col="1">
                                <Label :text="$t('pages.eventHome.scancodeDesktopConnected')" class="text-base font-semibold text-card-foreground" />
                                <Label :text="scancodeDesktopUrl" class="text-sm text-muted-foreground mt-1" textWrap="true" />
                            </StackLayout>
                        </GridLayout>
                    </StackLayout>

                </StackLayout>
            </ScrollView>
            <StackLayout v-if="eventDisplay" row="2" class="footer-bar">
                <Button :text="$t('pages.eventHome.backToEvents')" class="btn-primary" @tap="goToEvents" />
            </StackLayout>
        </GridLayout>
    </Page>
</template>

<script setup lang="ts">
import { computed, ref, type ComputedRef, type Ref } from 'vue';
import { BarcodeScanner } from 'nativescript-barcodescanner';
import { useTranslation } from '../../../composables/useTranslation';
import { useNavigation } from '../../../composables/useNavigation';
import { useCurrentEvent } from '../../../composables/repository/useCurrentEvent';
import { useScancodeDesktop } from '../../../composables/useScancodeDesktop';
import { showToast } from '../../../composables/toast-state';
import { ScancodeDesktopAdapter } from '../../../integrations/adapters/scancode-desktop-adapter';
import { ApiException } from '../../../types/exceptions/api-exception';
import type { EventItem } from '../../../types/event-item';
import { Icons } from '../../../utils/icons';
import { Format } from '../../../utils/format';
import { Haptics } from '../../../utils/haptics';
import type { ScancodeDesktopHealthy } from '../../../types/schema/scancode-desktop/healthy';
import HeaderComponent from '../../../components/HeaderComponent.vue';
import EventsPage from '../../EventsPage.vue';

type HomeEventDisplay = EventItem;

const { t } = useTranslation();
const { navigateTo } = useNavigation();

const isConnectingScancodeDesktop: Ref<boolean> = ref<boolean>(false);

const currentEvent = useCurrentEvent.getEvent();
const loading = useCurrentEvent.getIsLoading();
const isScancodeDesktopIntegrationRequired = useScancodeDesktop.isScancodeDesktopIntegrationRequired;
const scancodeDesktopUrl = useScancodeDesktop.getUrl();

const eventDisplay: ComputedRef<HomeEventDisplay | null> = computed(() => {
    const row = currentEvent.value;
    if (!row) {
        return null;
    }
    const orders = row.orders ?? [];
    const totalValue = orders.reduce((sum, order) => {
        const orderTotal = (order.order_items ?? []).reduce(
            (s, item) => s + item.price * item.qty,
            0,
        );
        return sum + orderTotal;
    }, 0);

    return {
        id: row.id,
        name: row.name,
        status: deriveEventStatus(row.start, row.end),
        totalValue,
        startDate: Format.formatIsoDateToBR(row.start),
        endDate: Format.formatIsoDateToBR(row.end),
        orderCount: orders.length,
        ordersSynced: orders.filter((o) => o.is_sync).length,
        ordersUnsynced: orders.filter((o) => !o.is_sync).length,
    };
});

const headerTitle: ComputedRef<string> = computed(() => {
    if (loading.value) {
        return '';
    }
    return eventDisplay.value?.name ?? '';
});

function todayYyyyMmDd(): string {
    const n: Date = new Date();
    const y: number = n.getFullYear();
    const m: string = String(n.getMonth() + 1).padStart(2, '0');
    const d: string = String(n.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function deriveEventStatus(start: string, end: string): 'scheduled' | 'in_progress' | 'ended' {
    const today: string = todayYyyyMmDd();
    if (today < start) {
        return 'scheduled';
    }
    if (today > end) {
        return 'ended';
    }
    return 'in_progress';
}

function goToEvents(): void {
    navigateTo(EventsPage, { frame: 'root-frame', clearHistory: true });
}

function isScanCancelled(error: unknown): boolean {
    const message: string = error instanceof Error ? error.message : String(error);
    return message.includes('Scan aborted') || message.includes('abort');
}

async function ensureCameraPermission(scanner: BarcodeScanner): Promise<boolean> {
    const hasPermission: boolean = await scanner.hasCameraPermission();
    if (hasPermission) {
        return true;
    }
    try {
        await scanner.requestCameraPermission();
    } catch {
        showToast({ message: t('pages.eventHome.scancodeDesktopPermissionDenied'), variant: 'error' });
        return false;
    }
    const granted: boolean = await scanner.hasCameraPermission();
    if (!granted) {
        showToast({ message: t('pages.eventHome.scancodeDesktopPermissionDenied'), variant: 'error' });
    }
    return granted;
}

async function readScancodeDesktopBaseUrl(): Promise<string | null> {
    const scanner: BarcodeScanner = new BarcodeScanner();
    const cameraAvailable: boolean = await scanner.available();
    if (!cameraAvailable) {
        showToast({ message: t('pages.eventHome.scancodeDesktopCameraUnavailable'), variant: 'error' });
        return null;
    }
    const hasPermission: boolean = await ensureCameraPermission(scanner);
    if (!hasPermission) {
        return null;
    }
    const result: { text: string } = await scanner.scan({
        formats: 'QR_CODE',
        cancelLabel: t('pages.eventHome.scancodeDesktopScanCancel'),
        message: t('pages.eventHome.scancodeDesktopScanMessage'),
        preferFrontCamera: false,
        showFlipCameraButton: false,
        showTorchButton: true,
        torchOn: false,
        resultDisplayDuration: 0,
        openSettingsIfPermissionWasPreviouslyDenied: true,
    });
    const baseUrl: string = result.text.trim();
    return baseUrl.length > 0 ? baseUrl : null;
}

async function onScancodeDesktopTap(): Promise<void> {
    if (isConnectingScancodeDesktop.value) {
        return;
    }
    isConnectingScancodeDesktop.value = true;
    try {
        const baseUrl: string | null = await readScancodeDesktopBaseUrl();
        if (baseUrl == null) {
            return;
        }
        useScancodeDesktop.setUrl(baseUrl);
        const health: ScancodeDesktopHealthy = await ScancodeDesktopAdapter.testConnection();
        useScancodeDesktop.setUrl(health.url);
        Haptics.vibrateSuccess();
        showToast({ message: t('pages.eventHome.scancodeDesktopConnectionSuccess'), variant: 'success' });
    } catch (error: unknown) {
        if (isScanCancelled(error)) {
            return;
        }
        const message: string = error instanceof ApiException
            ? error.message
            : t('pages.eventHome.scancodeDesktopConnectionError');
        showToast({ message, variant: 'error' });
    } finally {
        isConnectingScancodeDesktop.value = false;
    }
}

function statusLabel(status: string): string {
    switch (status) {
        case 'in_progress': return t('pages.events.statusInProgress');
        case 'scheduled': return t('pages.events.statusScheduled');
        case 'ended': return t('pages.events.statusEnded');
        default: return status;
    }
}

function statusBadgeClass(status: string): string {
    switch (status) {
        case 'in_progress': return 'badge-success';
        case 'scheduled': return 'badge-secondary';
        case 'ended': return 'badge-outline';
        default: return 'badge-outline';
    }
}

</script>
