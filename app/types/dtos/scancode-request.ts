import type { OrderStatus } from '../schema/order';

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

/** POST /orders — one line item (body `order_items[]`). */
export interface OrderCreateItemRequestDTO {
    product_id: number;
    price: number;
    qty: number;
    notes: string | null;
}

/**
 * POST /orders — `sales_representative_id` is set by the API from the auth token, not sent in the body.
 */
export interface OrderCreateRequestDTO {
    event_id: number;
    client_id: number;
    payment_method_id: number | null;
    notes: string | null;
    buyer_name: string | null;
    buyer_phone: string | null;
    status: OrderStatus;
    order_items: OrderCreateItemRequestDTO[];
}

/** PATCH /orders/:id — one line item (body `order_items[]`). */
export type OrderUpdateItemRequestDTO = OrderCreateItemRequestDTO;

/**
 * PATCH /orders/:id — `event_id` and `sales_representative_id` are not sent; server keeps them.
 */
export interface OrderUpdateRequestDTO {
    client_id: number;
    payment_method_id: number | null;
    notes: string | null;
    buyer_name: string | null;
    buyer_phone: string | null;
    status: OrderStatus;
    order_items: OrderUpdateItemRequestDTO[];
}
