/**
 * Client entity.
 */
export interface Client {
    id: number;
    cpf_cnpj: string;
    corporate_name: string;
    fantasy_name: string;
    email: string;
    phone: string;
    carrier: string;
}
