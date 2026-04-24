// --- Imports ---
import { paymentMethodFormValidation, type PaymentMethodFormFieldKey, type PaymentMethodFormFields } from '../validation/payment-method-form-validation';
import type { PaymentMethodFormSchema } from '../types/form/payment-method-form-schema';
import type { PaymentMethod } from '../types/schema/payment-method';
import { PaymentMethodsRepository } from '../db/repositories/payment-methods.repo';
import { ref, type Ref } from 'vue';
import { i18n } from '../configs/i18n';
import type { core } from 'zod';


class UsePaymentMethodFormValidation {
    private static readonly _instance: UsePaymentMethodFormValidation = new UsePaymentMethodFormValidation();

    public readonly fieldErrors: Ref<Partial<Record<PaymentMethodFormFieldKey, string>>>;

    private constructor() {
        this.fieldErrors = ref<Partial<Record<PaymentMethodFormFieldKey, string>>>({});
    }

    public static getInstance(): UsePaymentMethodFormValidation {
        return UsePaymentMethodFormValidation._instance;
    }

    public clearFieldErrors(): void {
        this.fieldErrors.value = {};
    }

    private mapIssueToMessage(issue: core.$ZodIssue): string {
        const t = i18n.global.t;
        const pathKey: unknown = issue.path[0];
        const key: string = typeof pathKey === 'string' ? pathKey : '';

        if (key === 'name') {
            if (issue.code === 'too_small') {
                return String(t('pages.paymentMethodForm.errors.nameRequired'));
            }
            if (issue.code === 'too_big') {
                return String(t('pages.paymentMethodForm.errors.nameMax'));
            }
        }

        return String(t('pages.paymentMethodForm.errors.generic'));
    }

    public async validatePaymentMethodForm(
        raw: PaymentMethodFormSchema,
        options: { ignorePaymentMethodId: number | null },
    ): Promise<PaymentMethodFormFields | null> {
        this.clearFieldErrors();
        const parsed = paymentMethodFormValidation.paymentMethodFormFieldsSchema.safeParse(raw);
        if (!parsed.success) {
            const nextErrors: Partial<Record<PaymentMethodFormFieldKey, string>> = {};
            for (const issue of parsed.error.issues) {
                const pathKey: unknown = issue.path[0];
                if (typeof pathKey !== 'string') {
                    continue;
                }
                const fieldKey: PaymentMethodFormFieldKey = pathKey as PaymentMethodFormFieldKey;
                if (nextErrors[fieldKey] !== undefined) {
                    continue;
                }
                nextErrors[fieldKey] = this.mapIssueToMessage(issue);
            }
            this.fieldErrors.value = nextErrors;
            return null;
        }
        const data: PaymentMethodFormFields = parsed.data;
        const found: PaymentMethod | null = await PaymentMethodsRepository.loadByName(data.name);
        const duplicate: boolean =
            found != null &&
            (options.ignorePaymentMethodId == null || found.id !== options.ignorePaymentMethodId);
        if (duplicate) {
            const t = i18n.global.t;
            this.fieldErrors.value = {
                name: String(t('pages.paymentMethodForm.errors.nameDuplicate')),
            };
            return null;
        }
        return data;
    }
}


export const usePaymentMethodFormValidation: UsePaymentMethodFormValidation = UsePaymentMethodFormValidation.getInstance();
