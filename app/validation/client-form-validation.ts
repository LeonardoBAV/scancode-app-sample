import { z } from 'zod';


class ClientFormValidation {

    private static readonly _instance: ClientFormValidation = new ClientFormValidation();

    private readonly trimmed = z.string().transform((s: string) => s.trim());

    private constructor() { }

    public static getInstance(): ClientFormValidation {
        return ClientFormValidation._instance;
    }

    public readonly clientFormFieldsSchema = z.object({
        carrier: this.trimmed.pipe(z.string().max(255)),
        corporate_name: this.trimmed.pipe(z.string().min(1).max(255)),
        cpf_cnpj: this.trimmed.pipe(z.string().min(1).max(18)),
        email: this.trimmed.pipe(z.union([z.literal(''), z.email().max(255)])),
        fantasy_name: this.trimmed.pipe(z.string().max(255)),
        phone: this.trimmed.pipe(z.string().max(255)),
    });

}

export const clientFormValidation: ClientFormValidation = ClientFormValidation.getInstance();

export type ClientFormFields = z.infer<typeof clientFormValidation.clientFormFieldsSchema>;
export type ClientFormFieldKey = keyof ClientFormFields;
