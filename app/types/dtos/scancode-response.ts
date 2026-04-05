export interface ValidationErrorResponseDTO {
    message: string;
    errors?: Record<string, string[]>;
}

export interface ProfileDTO {
    id: number;
    cpf: string;
    name: string;
    email: string;
    created_at: string;
    updated_at: string;
    distributor_id: number;
}

export interface LoginResponseDTO {
    token: string;
    sales_representative: ProfileDTO;
}

export interface EventDTO {
    id: number;
    name: string;
    start: string;
    end: string;
    created_at: string;
    updated_at: string;
}

export interface EventsResponseDTO {
    data: EventDTO[];
}

export interface ClientDTO {
    id: number;
    cpf_cnpj: string;
    corporate_name: string;
    fantasy_name: string | null;
    email: string | null;
    phone: string | null;
    carrier: string | null;
    created_at: string;
    updated_at: string;
}

export interface ClientsResponseDTO {
    data: ClientDTO[];
}

export interface ProductCategoryDTO {
    id: number;
    name: string;
}

export interface ProductDTO {
    id: number;
    sku: string;
    barcode: string | null;
    name: string;
    price: string;
    product_category_id: number;
    created_at: string;
    updated_at: string;
    product_category: ProductCategoryDTO;
}

export interface ProductsResponseDTO {
    data: ProductDTO[];
}

export interface PaymentMethodDTO {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface PaymentMethodsResponseDTO {
    data: PaymentMethodDTO[];
}
