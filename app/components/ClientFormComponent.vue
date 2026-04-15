<template>
    <GridLayout rows="*, auto" class="bg-background">
        <ScrollView row="0">
            <StackLayout class="p-4 pb-2">
                <StackLayout class="card p-0" androidElevation="2">
                    <StackLayout class="p-4">
                        <Label :text="$t('pages.orderClientShow.fantasyName')" class="text-xs text-muted-foreground mb-1" />
                        <TextField
                            v-model="fantasyName"
                            :hint="$t('pages.clientForm.fantasyNameHint')"
                            :class="inputFieldClass('fantasy_name')"
                            placeholderColor="#a1a1aa"
                        />
                        <Label v-if="fieldErrors.fantasy_name" :text="fieldErrors.fantasy_name" textWrap="true" class="text-xs text-destructive mt-1" />
                    </StackLayout>
                    <StackLayout class="bg-border mx-4" style="height: 1" />
                    <StackLayout class="p-4">
                        <Label :text="$t('pages.orderClientShow.corporateName')" class="text-xs text-muted-foreground mb-1" />
                        <TextField
                            v-model="corporateName"
                            :hint="$t('pages.clientForm.corporateNameHint')"
                            :class="inputFieldClass('corporate_name')"
                            placeholderColor="#a1a1aa"
                        />
                        <Label v-if="fieldErrors.corporate_name" :text="fieldErrors.corporate_name" textWrap="true" class="text-xs text-destructive mt-1" />
                    </StackLayout>
                    <StackLayout class="bg-border mx-4" style="height: 1" />
                    <StackLayout class="p-4">
                        <Label :text="$t('pages.orderClientShow.cpfCnpj')" class="text-xs text-muted-foreground mb-1" />
                        <TextField
                            v-model="cpfCnpj"
                            :hint="$t('pages.clientForm.cpfCnpjHint')"
                            :class="inputFieldClass('cpf_cnpj')"
                            keyboardType="number"
                            placeholderColor="#a1a1aa"
                        />
                        <Label v-if="fieldErrors.cpf_cnpj" :text="fieldErrors.cpf_cnpj" textWrap="true" class="text-xs text-destructive mt-1" />
                    </StackLayout>
                    <StackLayout class="bg-border mx-4" style="height: 1" />
                    <StackLayout class="p-4">
                        <Label :text="$t('pages.orderClientShow.email')" class="text-xs text-muted-foreground mb-1" />
                        <TextField
                            v-model="email"
                            :hint="$t('pages.clientForm.emailHint')"
                            :class="inputFieldClass('email')"
                            keyboardType="email"
                            autocorrect="false"
                            autocapitalizationType="none"
                            placeholderColor="#a1a1aa"
                        />
                        <Label v-if="fieldErrors.email" :text="fieldErrors.email" textWrap="true" class="text-xs text-destructive mt-1" />
                    </StackLayout>
                    <StackLayout class="bg-border mx-4" style="height: 1" />
                    <StackLayout class="p-4">
                        <Label :text="$t('pages.orderClientShow.phone')" class="text-xs text-muted-foreground mb-1" />
                        <TextField
                            v-model="phone"
                            :hint="$t('pages.clientForm.phoneHint')"
                            :class="inputFieldClass('phone')"
                            keyboardType="phone"
                            placeholderColor="#a1a1aa"
                        />
                        <Label v-if="fieldErrors.phone" :text="fieldErrors.phone" textWrap="true" class="text-xs text-destructive mt-1" />
                    </StackLayout>
                    <StackLayout class="bg-border mx-4" style="height: 1" />
                    <StackLayout class="p-4">
                        <Label :text="$t('pages.clientForm.carrier')" class="text-xs text-muted-foreground mb-1" />
                        <TextField
                            v-model="carrier"
                            :hint="$t('pages.clientForm.carrierHint')"
                            :class="inputFieldClass('carrier')"
                            placeholderColor="#a1a1aa"
                        />
                        <Label v-if="fieldErrors.carrier" :text="fieldErrors.carrier" textWrap="true" class="text-xs text-destructive mt-1" />
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
import { useClientFormValidation } from '../composables/useClientFormValidation';
import type { ClientFormFieldKey, ClientFormFields } from '../validation/client-form-validation';
import type { Client } from '../types/schema/client';
import { ref, watch, type Ref } from 'vue';


// --- Component logic ---
const props = defineProps<{
    client: Client;
}>();

const emit = defineEmits<{
    save: [client: Client];
}>();

const fieldErrors = useClientFormValidation.fieldErrors;

const fantasyName: Ref<string> = ref('');
const corporateName: Ref<string> = ref('');
const cpfCnpj: Ref<string> = ref('');
const email: Ref<string> = ref('');
const phone: Ref<string> = ref('');
const carrier: Ref<string> = ref('');

watch(
    () => props.client,
    (client: Client) => {
        applyClientToFields(client);
        useClientFormValidation.clearFieldErrors();
    },
    { immediate: true },
);

async function onSave(): Promise<void> {
    const validated: ClientFormFields | null = await validateForm();
    if (!validated) {
        return;
    }
    const client: Client = {
        ...props.client,
        fantasy_name: validated.fantasy_name,
        corporate_name: validated.corporate_name,
        cpf_cnpj: validated.cpf_cnpj,
        email: validated.email,
        phone: validated.phone,
        carrier: validated.carrier,
        is_sync: false,
    };
    emit('save', client);
}

function applyClientToFields(client: Client): void {
    fantasyName.value = client.fantasy_name ?? '';
    corporateName.value = client.corporate_name ?? '';
    cpfCnpj.value = client.cpf_cnpj ?? '';
    email.value = client.email ?? '';
    phone.value = client.phone ?? '';
    carrier.value = client.carrier ?? '';
}

async function validateForm(): Promise<ClientFormFields | null> {
    return await useClientFormValidation.validateClientForm(
        {
            carrier: carrier.value,
            corporate_name: corporateName.value,
            cpf_cnpj: cpfCnpj.value,
            email: email.value,
            fantasy_name: fantasyName.value,
            phone: phone.value,
        },
        { ignoreClientId: props.client.id },
    );
}

function inputFieldClass(field: ClientFormFieldKey): string {
    const message: string | undefined = fieldErrors.value[field];
    return message !== undefined && message !== '' ? 'input-field-invalid' : 'input-field';
}
</script>
