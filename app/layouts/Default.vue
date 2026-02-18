<template>
    <Page>
        <ActionBar class="action-bar">
            <Label :text="event.name" class="font-bold text-lg" />
            <ActionItem text="👤 Perfil" @tap="openProfile" />
        </ActionBar>

        <TabView androidTabsPosition="bottom">
            <TabViewItem title="Evento">
                <Frame>
                    <Home :event="event" />
                </Frame>
            </TabViewItem>
            <TabViewItem title="Pedidos">
                <Frame>
                    <OrderList />
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
import { getCurrentInstance } from 'vue';
import type { EventItem } from '../types/event-item';
import Home from '../pages/event/home/Home.vue';
import Cart from '../pages/event/Cart/Cart.vue';
import OrderList from '../pages/event/orders/OrderList.vue';
import Profile from '../pages/Profile.vue';

const props = defineProps<{ event: EventItem }>();
const event = props.event;

const instance = getCurrentInstance();
const globals = instance?.appContext.config.globalProperties;
const navigateTo = globals?.$navigateTo as (target: unknown, options?: Record<string, unknown>) => void;

function openProfile(): void {
    navigateTo?.(Profile, { frame: 'root-frame' });
}
</script>
