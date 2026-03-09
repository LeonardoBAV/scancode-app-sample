<template>
    <Page>
        <ActionBar class="action-bar">
            <Label :text="event.name" class="font-bold text-lg" />
            <ActionItem text="👤 Perfil" @tap="openProfile" />
        </ActionBar>

        <TabView ref="tabViewRef" :selectedIndex="selectedIndex" androidTabsPosition="bottom" class="tab-view-custom" @selectedIndexChange="onSelectedIndexChange">
            <TabViewItem title="Evento">
                <Frame>
                    <Home :event="event" />
                </Frame>
            </TabViewItem>
            <TabViewItem title="Pedidos">
                <Frame>
                    <OrderListPage />
                </Frame>
            </TabViewItem>
            <TabViewItem title="Sacola">
                <Frame>
                    <Cart />
                </Frame>
            </TabViewItem>
        </TabView>
    </Page>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue';
import type { EventItem } from '../types/event-item';
import Home from '../pages/event/home/Home.vue';
import Cart from '../pages/event/cart/Cart.vue';
import OrderListPage from '../pages/event/orders/OrderListPage.vue';
import Profile from '../pages/Profile/Profile.vue';

const props = defineProps<{ event: EventItem }>();
const event = props.event;

/** Currently selected tab index: 0 = Evento, 1 = Pedidos, 2 = Sacola */
const selectedIndex = ref(0);
const tabViewRef = ref(null);

const instance = getCurrentInstance();
const globals = instance?.appContext.config.globalProperties;
const navigateTo = globals?.$navigateTo as (target: unknown, options?: Record<string, unknown>) => void;

function onSelectedIndexChange(args: { newIndex: number }): void {
    selectedIndex.value = args.newIndex;
}

function openProfile(): void {
    navigateTo?.(Profile, {
        frame: 'root-frame',
        transition: { name: 'slideLeft', duration: 300 },
    });
}
</script>

<style scoped>
.tab-view-custom {
    selected-tab-text-color: #2563eb;
    tab-text-color: #64748b;
    android-selected-tab-highlight-color: #2563eb;
}
</style>
