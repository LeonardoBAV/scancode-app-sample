<template>
    <GridLayout rows="*, auto" class="bg-background">
        <ScrollView row="0">
            <StackLayout class="p-4 pb-2">
                <StackLayout class="card p-0" androidElevation="2">
                    <StackLayout class="p-4">
                        <Label :text="$t('pages.orderClientShow.fantasyName')" class="text-xs text-muted-foreground mb-1" />
                        <TextField v-model="fantasyName" :hint="$t('pages.clientForm.fantasyNameHint')" class="input-field" placeholderColor="#a1a1aa" />
                    </StackLayout>
                    <StackLayout class="bg-border mx-4" style="height: 1" />
                    <StackLayout class="p-4">
                        <Label :text="$t('pages.orderClientShow.corporateName')" class="text-xs text-muted-foreground mb-1" />
                        <TextField v-model="corporateName" :hint="$t('pages.clientForm.corporateNameHint')" class="input-field" placeholderColor="#a1a1aa" />
                    </StackLayout>
                    <StackLayout class="bg-border mx-4" style="height: 1" />
                    <StackLayout class="p-4">
                        <Label :text="$t('pages.orderClientShow.cpfCnpj')" class="text-xs text-muted-foreground mb-1" />
                        <TextField v-model="cpfCnpj" :hint="$t('pages.clientForm.cpfCnpjHint')" class="input-field" keyboardType="number" placeholderColor="#a1a1aa" />
                    </StackLayout>
                    <StackLayout class="bg-border mx-4" style="height: 1" />
                    <StackLayout class="p-4">
                        <Label :text="$t('pages.orderClientShow.email')" class="text-xs text-muted-foreground mb-1" />
                        <TextField v-model="email" :hint="$t('pages.clientForm.emailHint')" class="input-field" keyboardType="email" autocorrect="false" autocapitalizationType="none" placeholderColor="#a1a1aa" />
                    </StackLayout>
                    <StackLayout class="bg-border mx-4" style="height: 1" />
                    <StackLayout class="p-4">
                        <Label :text="$t('pages.orderClientShow.phone')" class="text-xs text-muted-foreground mb-1" />
                        <TextField v-model="phone" :hint="$t('pages.clientForm.phoneHint')" class="input-field" keyboardType="phone" placeholderColor="#a1a1aa" />
                    </StackLayout>
                    <StackLayout class="bg-border mx-4" style="height: 1" />
                    <StackLayout class="p-4">
                        <Label :text="$t('pages.clientForm.carrier')" class="text-xs text-muted-foreground mb-1" />
                        <TextField v-model="carrier" :hint="$t('pages.clientForm.carrierHint')" class="input-field" placeholderColor="#a1a1aa" />
                    </StackLayout>
                </StackLayout>
            </StackLayout>
        </ScrollView>

        <StackLayout row="1" class="footer-bar" androidElevation="2" iosElevation="2">
            <Button :text="$t('pages.clientForm.save')" class="btn-primary w-full" horizontalAlignment="stretch" @tap="onSave" />
        </StackLayout>
    </GridLayout>
</template>

<script setup lang="ts">
// --- Imports ---
import { ref, watch, type Ref } from 'vue';
import type { Client } from '../types/schema/client';


// --- Component logic ---
const props = defineProps<{
    client: Client;
}>();

const emit = defineEmits<{
    save: [client: Client];
}>();

const fantasyName: Ref<string> = ref('');
const corporateName: Ref<string> = ref('');
const cpfCnpj: Ref<string> = ref('');
const email: Ref<string> = ref('');
const phone: Ref<string> = ref('');
const carrier: Ref<string> = ref('');

function applyClientToFields(c: Client): void {
    fantasyName.value = c.fantasy_name ?? '';
    corporateName.value = c.corporate_name ?? '';
    cpfCnpj.value = c.cpf_cnpj ?? '';
    email.value = c.email ?? '';
    phone.value = c.phone ?? '';
    carrier.value = c.carrier ?? '';
}

watch(
    () => props.client,
    (c: Client) => {
        applyClientToFields(c);
    },
    { immediate: true },
);

function onSave(): void {
    const base: Client = props.client;
    const next: Client = {
        ...base,
        fantasy_name: fantasyName.value.trim(),
        corporate_name: corporateName.value.trim(),
        cpf_cnpj: cpfCnpj.value.trim(),
        email: email.value.trim(),
        phone: phone.value.trim(),
        carrier: carrier.value.trim(),
        is_sync: false,
    };
    emit('save', next);
}
</script>
