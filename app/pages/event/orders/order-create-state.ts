import { ref } from 'vue';

/** Shared state for order create flow: selected payment method and client. */
export const orderCreatePaymentMethodName = ref<string>('');
export const orderCreateClientFantasyName = ref<string>('Alpha Store');
export const orderCreateClientCpfCnpj = ref<string>('12.345.678/0001-90');
