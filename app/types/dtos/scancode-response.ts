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

export interface OrderItemDTO {
    id: number;
    distributor_id: number;
    order_id: number;
    product_id: number;
    price: string;
    qty: number;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface OrderDTO {
    id: number;
    distributor_id: number;
    event_id: number;
    status: string;
    notes: string | null;
    /** New (nullable) buyer fields on Order; omitted on older servers. */
    buyer_name?: string | null;
    buyer_phone?: string | null;
    client_id: number;
    sales_representative_id: number;
    payment_method_id: number;
    created_at: string;
    updated_at: string;
    order_items: OrderItemDTO[];
}

/** POST /orders — envelope matches other resource responses. */
export interface OrderResponseDTO {
    data: OrderDTO;
}

export interface EventDTO {
    id: number;
    name: string;
    start: string;
    end: string;
    created_at: string;
    updated_at: string;
    orders?: OrderDTO[];
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
    /** Present after API supports buyer fields; omitted on older servers. */
    buyer_name?: string | null;
    buyer_contact?: string | null;
    created_at: string;
    updated_at: string;
}

export interface ClientsResponseDTO {
    data: ClientDTO[];
}

export interface ClientResponseDTO {
    data: ClientDTO;
}

export interface ProductCategoryDTO {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface ProductCategoriesResponseDTO {
    data: ProductCategoryDTO[];
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

/** PATCH /products/:id — body may omit nested product_category */
export interface ProductUpdatedDTO {
    id: number;
    sku: string;
    barcode: string | null;
    name: string;
    price: string;
    product_category_id: number;
    created_at: string;
    updated_at: string;
    product_category?: ProductCategoryDTO;
}

export interface ProductResponseDTO {
    data: ProductUpdatedDTO;
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

export interface PaymentMethodResponseDTO {
    data: PaymentMethodDTO;
}
