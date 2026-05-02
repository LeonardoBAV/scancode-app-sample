export interface Client {
    id: number | null;
    remote_id: number | null;
    is_sync: boolean;
    cpf_cnpj: string;
    corporate_name: string;
    fantasy_name: string;
    email: string;
    phone: string;
    carrier: string;
    buyer_name: string | null;
    buyer_contact: string | null;
    created_at: string;
    updated_at: string;
}
