<template>
    <ActionBar class="action-bar">
        <Label :text="title" class="font-bold text-lg" />
        <ActionItem :text="userName" />
    </ActionBar>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ApplicationSettings } from '@nativescript/core'

const USER_NAME_KEY = 'user_name'
const userName = ref(ApplicationSettings.getString(USER_NAME_KEY) || 'Usuário')

defineProps<{ title: string }>()
</script>
