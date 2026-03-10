<template>
    <Page actionBarHidden="true">
        <TabView :selectedIndex="selectedIndex" androidTabsPosition="bottom" class="tab-view bg-background" @selectedIndexChange="onSelectedIndexChange">
            <TabViewItem :title="$t('pages.eventLayout.tabHome')" :iconSource="iconHome">
                <Frame>
                    <Home :event="event" />
                </Frame>
            </TabViewItem>
            <TabViewItem :title="$t('pages.eventLayout.tabOrders')" :iconSource="iconOrders">
                <Frame>
                    <OrderListPage />
                </Frame>
            </TabViewItem>
            <TabViewItem :title="$t('pages.eventLayout.tabCart')" :iconSource="iconCart">
                <Frame>
                    <Cart />
                </Frame>
            </TabViewItem>
        </TabView>
    </Page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { EventItem } from '../types/event-item';
import Home from '../pages/event/home/Home.vue';
import Cart from '../pages/event/cart/Cart.vue';
import OrderListPage from '../pages/event/orders/OrderListPage.vue';

const props = defineProps<{ event: EventItem }>();
const event = props.event;

const selectedIndex = ref(0);
const iconHome = ref('res://ic_tab_home_selected');
const iconOrders = ref('res://ic_tab_receipt');
const iconCart = ref('res://ic_tab_cart');

function resetIcons(): void {
    iconHome.value = 'res://ic_tab_home';
    iconOrders.value = 'res://ic_tab_receipt';
    iconCart.value = 'res://ic_tab_cart';
}

function setSelectedIcon(index: number): void {
    switch (index) {
        case 0:
            iconHome.value = 'res://ic_tab_home_selected';
            break;
        case 1:
            iconOrders.value = 'res://ic_tab_receipt_selected';
            break;
        case 2:
            iconCart.value = 'res://ic_tab_cart_selected';
            break;
    }
}

function onSelectedIndexChange(args: { newIndex?: number; value?: number }): void {
    const idx = args.newIndex ?? args.value ?? 0;
    selectedIndex.value = idx;
    resetIcons();
    setSelectedIcon(idx);
    setTimeout(() => {
        resetIcons();
        setSelectedIcon(idx);
    }, 0);
}
</script>

