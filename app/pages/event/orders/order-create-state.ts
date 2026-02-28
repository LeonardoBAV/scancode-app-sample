import { ref } from 'vue';
import type { Client } from '../../../types/client';

/** Default client for initial state. */
const defaultClient: Client = {
    id: 1,
    cpf_cnpj: '12.345.678/0001-90',
    corporate_name: 'Alpha Comércio Ltda',
    fantasy_name: 'Alpha Store',
    email: 'contato@alpha.com',
    phone: '(11) 99999-0001',
    carrier: 'Vivo',
};

/** Shared state for order create flow: selected payment method and client. */
export const orderCreatePaymentMethodName = ref<string>('');
export const orderCreateClientFantasyName = ref<string>(defaultClient.fantasy_name);
export const orderCreateClientCpfCnpj = ref<string>(defaultClient.cpf_cnpj);
/** Full selected client for show page; kept in sync when user selects from list. */
export const orderCreateSelectedClient = ref<Client | null>(defaultClient);
/** Buyer name and contact (English labels) on OrderClientShowPage. */
export const orderCreateBuyerName = ref<string>('');
export const orderCreateBuyerContact = ref<string>('');
