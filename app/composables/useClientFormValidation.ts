// --- Imports ---
import { clientFormValidation, type ClientFormFieldKey, type ClientFormFields } from '../validation/client-form-validation';
import type { ClientFormSchema } from '../types/form/client-form-schema';
import { i18n } from '../configs/i18n';
import { ref, type Ref } from 'vue';
import type { core } from 'zod';


export class UseClientFormValidation {
    private static readonly _instance: UseClientFormValidation = new UseClientFormValidation();

    public readonly fieldErrors: Ref<Partial<Record<ClientFormFieldKey, string>>>;

    private constructor() {
        this.fieldErrors = ref<Partial<Record<ClientFormFieldKey, string>>>({});
    }

    public static getInstance(): UseClientFormValidation {
        return UseClientFormValidation._instance;
    }

    public clearFieldErrors(): void {
        this.fieldErrors.value = {};
    }

    private mapIssueToMessage(issue: core.$ZodIssue): string {
        const t = i18n.global.t;
        const pathKey: unknown = issue.path[0];
        const key: string = typeof pathKey === 'string' ? pathKey : '';

        if (key === 'cpf_cnpj') {
            if (issue.code === 'too_small') {
                return String(t('pages.clientForm.errors.cpfCnpjRequired'));
            }
            if (issue.code === 'too_big') {
                return String(t('pages.clientForm.errors.cpfCnpjMax'));
            }
        }
        if (key === 'corporate_name') {
            if (issue.code === 'too_small') {
                return String(t('pages.clientForm.errors.corporateNameRequired'));
            }
            if (issue.code === 'too_big') {
                return String(t('pages.clientForm.errors.corporateNameMax'));
            }
        }
        if (key === 'fantasy_name' && issue.code === 'too_big') {
            return String(t('pages.clientForm.errors.fantasyNameMax'));
        }
        if (key === 'email') {
            if (issue.code === 'too_big') {
                return String(t('pages.clientForm.errors.emailMax'));
            }
            if (issue.code === 'invalid_format' && issue.format === 'email') {
                return String(t('pages.clientForm.errors.invalidEmail'));
            }
        }
        if (key === 'phone' && issue.code === 'too_big') {
            return String(t('pages.clientForm.errors.phoneMax'));
        }
        if (key === 'carrier' && issue.code === 'too_big') {
            return String(t('pages.clientForm.errors.carrierMax'));
        }

        return String(t('pages.clientForm.errors.generic'));
    }


    public validateClientForm(raw: ClientFormSchema): ClientFormFields | null {
        this.clearFieldErrors();
        const parsed = clientFormValidation.clientFormFieldsSchema.safeParse(raw);
        if (parsed.success) {
            return parsed.data;
        }
        const nextErrors: Partial<Record<ClientFormFieldKey, string>> = {};
        for (const issue of parsed.error.issues) {
            const pathKey: unknown = issue.path[0];
            if (typeof pathKey !== 'string') {
                continue;
            }
            const fieldKey: ClientFormFieldKey = pathKey as ClientFormFieldKey;
            if (nextErrors[fieldKey] !== undefined) {
                continue;
            }
            nextErrors[fieldKey] = this.mapIssueToMessage(issue);
        }
        this.fieldErrors.value = nextErrors;
        return null;
    }
}


export const useClientFormValidation: UseClientFormValidation = UseClientFormValidation.getInstance();
