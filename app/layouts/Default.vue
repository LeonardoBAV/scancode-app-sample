<template>
    <Page>
        <ActionBar class="action-bar">
            <Label :text="event.name" class="font-bold text-lg" />
            <ActionItem text="👤 Perfil" @tap="openProfile" />
        </ActionBar>

        <TabView androidTabsPosition="bottom">
            <TabViewItem title="Evento">
                <Frame>
                    <Event :event="event" />
                </Frame>
            </TabViewItem>
            <TabViewItem title="Produtos">
                <Frame>
                    <ProductsList :event="event" />
                </Frame>
            </TabViewItem>
            <TabViewItem title="Clientes">
                <Frame>
                    <ClientsList :event="event" />
                </Frame>
            </TabViewItem>
        </TabView>
    </Page>
</template>

<script setup lang="ts">
import { getCurrentInstance } from 'vue'
import type { EventItem } from '../types/event-item'
import Event from '../pages/Event.vue'
import ProductsList from '../pages/ProductsList.vue'
import ClientsList from '../pages/ClientsList.vue'
import Profile from '../pages/Profile.vue'

const props = defineProps<{ event: EventItem }>()
const event = props.event

const instance = getCurrentInstance()
const globals = instance?.appContext.config.globalProperties
const navigateTo = globals?.$navigateTo as (target: unknown, options?: Record<string, unknown>) => void

function openProfile() {
    navigateTo?.(Profile, { frame: 'root-frame' })
}
</script>
