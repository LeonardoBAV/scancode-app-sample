export interface ClientFormSchema {
    carrier: string;
    corporate_name: string;
    cpf_cnpj: string;
    email: string;
    fantasy_name: string;
    phone: string;
    /** Raw input; validated output is `string | null`. */
    buyer_name: string;
    buyer_contact: string;
}
