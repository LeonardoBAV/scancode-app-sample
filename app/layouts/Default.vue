<template>
    <Page actionBarHidden="true">
        <GridLayout rows="auto, *" class="bg-background">

            <!-- Header with event name + avatar -->
            <HeaderComponent row="0" :title="event.name" />

            <!-- TabView -->
            <TabView
                row="1"
                :selectedIndex="selectedIndex"
                androidTabsPosition="bottom"
                class="tab-view"
                @selectedIndexChange="onSelectedIndexChange"
            >
                <TabViewItem :title="$t('pages.eventLayout.tabHome')">
                    <Frame>
                        <Home :event="event" />
                    </Frame>
                </TabViewItem>
                <TabViewItem :title="$t('pages.eventLayout.tabOrders')">
                    <Frame>
                        <OrderListPage />
                    </Frame>
                </TabViewItem>
                <TabViewItem :title="$t('pages.eventLayout.tabCart')">
                    <Frame>
                        <Cart />
                    </Frame>
                </TabViewItem>
            </TabView>

        </GridLayout>
    </Page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { EventItem } from '../types/event-item';
import HeaderComponent from '../components/HeaderComponent.vue';
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
