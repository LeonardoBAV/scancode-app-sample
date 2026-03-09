<template>
    <Page actionBarHidden="true">
        <TabView :selectedIndex="selectedIndex" androidTabsPosition="bottom" class="tab-view bg-background" @selectedIndexChange="onSelectedIndexChange">
            <TabViewItem :title="$t('pages.eventLayout.tabHome')" iconSource="res://ic_tab_home_selector">
                <Frame>
                    <Home :event="event" />
                </Frame>
            </TabViewItem>
            <TabViewItem :title="$t('pages.eventLayout.tabOrders')" iconSource="res://ic_tab_receipt_selector">
                <Frame>
                    <OrderListPage />
                </Frame>
            </TabViewItem>
            <TabViewItem :title="$t('pages.eventLayout.tabCart')" iconSource="res://ic_tab_cart_selector">
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

function onSelectedIndexChange(args: { newIndex: number }): void {
    selectedIndex.value = args.newIndex;
}
</script>

<style scoped>
.tab-view {
    tab-background-color: #ffffff;
    selected-tab-text-color: #18181b;
    tab-text-color: #71717a;
    android-selected-tab-highlight-color: #18181b;
    tab-text-font-size: 13;
}
</style>
