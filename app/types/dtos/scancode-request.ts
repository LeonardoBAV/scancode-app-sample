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
    buyer_name: string | null;
    buyer_contact: string | null;
}

export type ClientCreateRequestDTO = ClientUpdateRequestDTO;

export interface ProductUpdateRequestDTO {
    sku: string;
    barcode: string;
    name: string;
    price: string;
    product_category_id: number;
}

/** POST /products — same body shape as PATCH */
export type ProductCreateRequestDTO = ProductUpdateRequestDTO;

/** PATCH /payment-methods/:id — server sets created_at / updated_at */
export interface PaymentMethodUpdateRequestDTO {
    name: string;
}

/** POST /payment-methods — same body shape as PATCH */
export type PaymentMethodCreateRequestDTO = PaymentMethodUpdateRequestDTO;
