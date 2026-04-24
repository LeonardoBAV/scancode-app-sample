import { z } from 'zod';


class PaymentMethodFormValidation {

    private static readonly _instance: PaymentMethodFormValidation = new PaymentMethodFormValidation();

    private readonly trimmed = z.string().transform((s: string) => s.trim());

    private constructor() { }

    public static getInstance(): PaymentMethodFormValidation {
        return PaymentMethodFormValidation._instance;
    }

    public readonly paymentMethodFormFieldsSchema = z.object({
        name: this.trimmed.pipe(z.string().min(1).max(255)),
    });

}

export const paymentMethodFormValidation: PaymentMethodFormValidation = PaymentMethodFormValidation.getInstance();

export type PaymentMethodFormFields = z.infer<typeof paymentMethodFormValidation.paymentMethodFormFieldsSchema>;
export type PaymentMethodFormFieldKey = keyof PaymentMethodFormFields;
