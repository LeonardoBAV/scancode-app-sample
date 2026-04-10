export interface LoginRequestDTO {
    cpf: string;
    password: string;
    device_name: string;
}

/** PATCH /clients/:id — server sets created_at / updated_at */
export interface ClientUpdateRequestDTO {
    cpf_cnpj: string;
    corporate_name: string;
    fantasy_name: string;
    email: string;
    phone: string;
    carrier: string;
}
