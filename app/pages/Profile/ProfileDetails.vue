<template>
    <Page actionBarHidden="true">
        <GridLayout rows="auto, *" class="bg-background">

            <HeaderComponent row="0" :title="$t('pages.profileDetails.title')" :showAvatar="false" />

            <ScrollView row="1">
                <StackLayout class="p-4">

                    <!-- Info Card -->
                    <StackLayout class="card p-0" androidElevation="2">

                        <!-- Name -->
                        <GridLayout columns="auto, *" class="p-4">
                            <Label col="0" :text="lucide('user')" class="lucide text-muted-foreground mr-4" verticalAlignment="top" />
                            <StackLayout col="1">
                                <Label :text="$t('pages.profileDetails.name')" class="text-xs text-muted-foreground mb-1" />
                                <Label :text="rep?.name ?? '—'" class="text-base text-card-foreground" textWrap="true" />
                            </StackLayout>
                        </GridLayout>

                        <StackLayout class="bg-border mx-4" style="height: 1" />

                        <!-- Username -->
                        <GridLayout columns="auto, *" class="p-4">
                            <Label col="0" :text="lucide('at-sign')" class="lucide text-muted-foreground mr-4" verticalAlignment="top" />
                            <StackLayout col="1">
                                <Label :text="$t('pages.profileDetails.username')" class="text-xs text-muted-foreground mb-1" />
                                <Label :text="rep?.name ?? '—'" class="text-base text-card-foreground" />
                            </StackLayout>
                        </GridLayout>

                        <StackLayout class="bg-border mx-4" style="height: 1" />

                        <!-- Email -->
                        <GridLayout columns="auto, *" class="p-4">
                            <Label col="0" :text="lucide('mail')" class="lucide text-muted-foreground mr-4" verticalAlignment="top" />
                            <StackLayout col="1">
                                <Label :text="$t('pages.profileDetails.email')" class="text-xs text-muted-foreground mb-1" />
                                <Label :text="rep?.email ?? '—'" class="text-base text-card-foreground" />
                            </StackLayout>
                        </GridLayout>

                        <StackLayout class="bg-border mx-4" style="height: 1" />

                        <!-- CPF -->
                        <GridLayout columns="auto, *" class="p-4">
                            <Label col="0" :text="lucide('hash')" class="lucide text-muted-foreground mr-4" verticalAlignment="top" />
                            <StackLayout col="1">
                                <Label :text="$t('pages.profileDetails.cpf')" class="text-xs text-muted-foreground mb-1" />
                                <Label :text="formatCPF(rep?.cpf)" class="text-base text-card-foreground" />
                            </StackLayout>
                        </GridLayout>

                        <StackLayout class="bg-border mx-4" style="height: 1" />

                        <!-- Distributor -->
                        <GridLayout columns="auto, *" class="p-4">
                            <Label col="0" :text="lucide('store')" class="lucide text-muted-foreground mr-4" verticalAlignment="top" />
                            <StackLayout col="1">
                                <Label :text="$t('pages.profileDetails.distributor')" class="text-xs text-muted-foreground mb-1" />
                                <Label :text="distributorLabel" class="text-base text-card-foreground" textWrap="true" />
                            </StackLayout>
                        </GridLayout>

                    </StackLayout>

                </StackLayout>
            </ScrollView>

        </GridLayout>
    </Page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, type ComputedRef } from 'vue';
import { getAuth } from '../../persistence/auth-session';
import type { AuthProfile } from '../../types/sessions/auth';
import { formatCPF } from '../../utils/format';
import { lucide } from '../../utils/icons';
import HeaderComponent from '../../components/HeaderComponent.vue';

const profile = ref<ReturnType<typeof getAuth>>(null);

const rep: ComputedRef<AuthProfile | undefined> = computed(() => profile.value?.sales_representative);

const distributorLabel: ComputedRef<string> = computed(() => {
    const id: number | undefined = rep.value?.distributor_id;
    return id != null ? String(id) : '—';
});

onMounted(() => {
    profile.value = getAuth();
});
</script>
