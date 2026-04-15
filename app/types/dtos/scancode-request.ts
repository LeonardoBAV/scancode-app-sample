export interface LoginRequestDTO {
    cpf: string;
    password: string;
    device_name: string;
}

export interface ClientUpdateRequestDTO {
    cpf_cnpj: string;
    corporate_name: string;
    fantasy_name: string;
    email: string;
    phone: string;
    carrier: string;
}

export type ClientCreateRequestDTO = ClientUpdateRequestDTO;

export interface ProductUpdateRequestDTO {
    sku: string;
    barcode: string;
    name: string;
    price: string;
    product_category_id: number;
}

/** PATCH /payment-methods/:id — server sets created_at / updated_at */
export interface PaymentMethodUpdateRequestDTO {
    name: string;
}
