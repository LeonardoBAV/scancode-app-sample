import type {
    ClientCreateRequestDTO,
    ClientUpdateRequestDTO,
    PaymentMethodCreateRequestDTO,
    PaymentMethodUpdateRequestDTO,
    ProductCreateRequestDTO,
    ProductUpdateRequestDTO,
} from '../../types/dtos/scancode-request';
import type { ValidationErrorResponseDTO } from '../../types/dtos/scancode-response';
import { ApiException } from '../../types/exceptions/api-exception';
import type { Auth } from '../../types/sessions/auth';
import type { Client } from '../../types/schema/client';
import type { Event } from '../../types/schema/event';
import type { Order } from '../../types/schema/order';
import type { OrderItem } from '../../types/schema/order-item';
import type { PaymentMethod } from '../../types/schema/payment-method';
import type { ProductCategory } from '../../types/schema/product-category';
import type { Product } from '../../types/schema/product';
import { ProductCategoriesRepository } from '../../db/repositories/product-categories.repo';
import { i18n } from '../../configs/i18n';
import { clearAuth } from '../../persistence/auth-session';
import { HttpError } from '../../types/http/http-types';
import { scancodeApi } from '../apis/scancode-api';


export class ScancodeAdapter {

    public static async login(cpf: string, password: string): Promise<Auth> {
        try {
            return await scancodeApi.login(cpf, password);
        } catch (err: unknown) {
            ScancodeAdapter.handleApiError(err);
        }
    }

    public static async getEvents(): Promise<Event[]> {
        try {
            const response = await scancodeApi.getEvents();

            return response.data.map((dto): Event => ({
                id: dto.id,
                remote_id: dto.id,
                is_sync: true,
                name: dto.name,
                start: dto.start,
                end: dto.end,
                created_at: dto.created_at,
                updated_at: dto.updated_at,
                orders: (dto.orders ?? []).map((orderDto): Order => ({
                    id: orderDto.id,
                    remote_id: orderDto.id,
                    event_id: orderDto.event_id,
                    status: orderDto.status,
                    notes: orderDto.notes,
                    client_id: orderDto.client_id,
                    sales_representative_id: orderDto.sales_representative_id,
                    payment_method_id: orderDto.payment_method_id,
                    is_sync: true,
                    created_at: orderDto.created_at,
                    updated_at: orderDto.updated_at,
                    order_items: orderDto.order_items.map((itemDto): OrderItem => ({
                        id: itemDto.id,
                        order_id: itemDto.order_id,
                        product_id: itemDto.product_id,
                        price: Number.parseFloat(itemDto.price),
                        qty: itemDto.qty,
                        notes: itemDto.notes,
                    })),
                })),
            }));
        } catch (err: unknown) {
            ScancodeAdapter.handleApiError(err);
        }
    }

    public static async getClients(): Promise<Client[]> {
        try {
            const response = await scancodeApi.getClients();

            return response.data.map((dto): Client => ({
                id: dto.id,
                remote_id: dto.id,
                is_sync: true,
                cpf_cnpj: dto.cpf_cnpj,
                corporate_name: dto.corporate_name,
                fantasy_name: ScancodeAdapter.nullableString(dto.fantasy_name),
                email: ScancodeAdapter.nullableString(dto.email),
                phone: ScancodeAdapter.nullableString(dto.phone),
                carrier: ScancodeAdapter.nullableString(dto.carrier),
                buyer_name: ScancodeAdapter.nullableBuyerField(dto.buyer_name),
                buyer_contact: ScancodeAdapter.nullableBuyerField(dto.buyer_contact),
                created_at: dto.created_at,
                updated_at: dto.updated_at,
            }));
        } catch (err: unknown) {
            ScancodeAdapter.handleApiError(err);
        }
    }

    public static async createClient(client: Client): Promise<Client> {
        try {
            const payload: ClientCreateRequestDTO = {
                carrier: client.carrier.trim(),
                corporate_name: client.corporate_name.trim(),
                cpf_cnpj: client.cpf_cnpj.trim(),
                email: client.email.trim(),
                fantasy_name: client.fantasy_name.trim(),
                phone: client.phone.trim(),
                buyer_name: ScancodeAdapter.toApiNullableString(client.buyer_name),
                buyer_contact: ScancodeAdapter.toApiNullableString(client.buyer_contact),
            };
            const response = await scancodeApi.postClient(payload);
            const dto = response.data;

            return {
                ...client,
                id: dto.id,
                carrier: ScancodeAdapter.nullableString(dto.carrier),
                corporate_name: dto.corporate_name,
                cpf_cnpj: dto.cpf_cnpj,
                email: ScancodeAdapter.nullableString(dto.email),
                fantasy_name: ScancodeAdapter.nullableString(dto.fantasy_name),
                phone: ScancodeAdapter.nullableString(dto.phone),
                buyer_name: ScancodeAdapter.nullableBuyerField(dto.buyer_name),
                buyer_contact: ScancodeAdapter.nullableBuyerField(dto.buyer_contact),
                created_at: dto.created_at,
                updated_at: dto.updated_at,
            };
        } catch (err: unknown) {
            ScancodeAdapter.handleApiError(err);
        }
    }

    public static async updateClient(client: Client): Promise<Client> {
        try {
            const payload: ClientUpdateRequestDTO = {
                carrier: client.carrier.trim(),
                corporate_name: client.corporate_name.trim(),
                cpf_cnpj: client.cpf_cnpj.trim(),
                email: client.email.trim(),
                fantasy_name: client.fantasy_name.trim(),
                phone: client.phone.trim(),
                buyer_name: ScancodeAdapter.toApiNullableString(client.buyer_name),
                buyer_contact: ScancodeAdapter.toApiNullableString(client.buyer_contact),
            };
            const response = await scancodeApi.patchClient(client.remote_id as number, payload);
            const dto = response.data;

            return {
                ...client,
                id: dto.id,
                carrier: ScancodeAdapter.nullableString(dto.carrier),
                corporate_name: dto.corporate_name,
                cpf_cnpj: dto.cpf_cnpj,
                email: ScancodeAdapter.nullableString(dto.email),
                fantasy_name: ScancodeAdapter.nullableString(dto.fantasy_name),
                phone: ScancodeAdapter.nullableString(dto.phone),
                buyer_name: ScancodeAdapter.nullableBuyerField(dto.buyer_name),
                buyer_contact: ScancodeAdapter.nullableBuyerField(dto.buyer_contact),
                created_at: dto.created_at,
                updated_at: dto.updated_at,
            };
        } catch (err: unknown) {
            ScancodeAdapter.handleApiError(err);
        }
    }

    public static async getProductCategories(): Promise<ProductCategory[]> {
        try {
            const response = await scancodeApi.getProductCategories();

            return response.data.map(
                (dto): ProductCategory => ({
                    id: dto.id,
                    remote_id: dto.id,
                    is_sync: true,
                    name: dto.name,
                    created_at: dto.created_at,
                    updated_at: dto.updated_at,
                }),
            );
        } catch (err: unknown) {
            ScancodeAdapter.handleApiError(err);
        }
    }

    public static async getProducts(): Promise<Product[]> {
        try {
            const response = await scancodeApi.getProducts();

            return response.data.map((dto): Product => ({
                id: dto.id,
                remote_id: dto.id,
                is_sync: true,
                sku: dto.sku,
                barcode: ScancodeAdapter.nullableString(dto.barcode),
                name: dto.name,
                price: Number.parseFloat(dto.price),
                product_category_id: dto.product_category_id,
                product_category: {
                    id: dto.product_category.id,
                    remote_id: dto.product_category.id,
                    is_sync: true,
                    name: dto.product_category.name,
                    created_at: dto.product_category.created_at,
                    updated_at: dto.product_category.updated_at,
                },
                created_at: dto.created_at,
                updated_at: dto.updated_at,
            }));
        } catch (err: unknown) {
            ScancodeAdapter.handleApiError(err);
        }
    }

    public static async createProduct(product: Product): Promise<Product> {
        try {
            const payload: ProductCreateRequestDTO = {
                barcode: product.barcode.trim(),
                name: product.name.trim(),
                price: product.price.toFixed(2),
                product_category_id: product.product_category_id,
                sku: product.sku.trim(),
            };
            console.log('payload', payload);
            const response = await scancodeApi.postProduct(payload);
            const dto = response.data;
            

            return {
                ...product,
                id: dto.id,
                barcode: ScancodeAdapter.nullableString(dto.barcode),
                created_at: dto.created_at,
                name: dto.name,
                price: Number.parseFloat(dto.price),
                product_category: product.product_category,
                product_category_id: dto.product_category_id,
                sku: dto.sku,
                updated_at: dto.updated_at,
            };
        } catch (err: unknown) {
            ScancodeAdapter.handleApiError(err);
        }
    }

    public static async updateProduct(product: Product): Promise<Product> {
        try {
            const payload: ProductUpdateRequestDTO = {
                sku: product.sku.trim(),
                barcode: product.barcode.trim(),
                name: product.name.trim(),
                price: product.price.toFixed(2),
                product_category_id: product.product_category_id,
            };
            const response = await scancodeApi.patchProduct(product.remote_id as number, payload);
            const dto = response.data;

            

            return {
                id: product.id,
                remote_id: dto.id,
                is_sync: true,
                sku: dto.sku,
                barcode: ScancodeAdapter.nullableString(dto.barcode),
                name: dto.name,
                price: Number.parseFloat(dto.price),
                product_category_id: dto.product_category_id,
                product_category: product.product_category,
                created_at: dto.created_at,
                updated_at: dto.updated_at,
            };
        } catch (err: unknown) {
            ScancodeAdapter.handleApiError(err);
        }
    }

    public static async getPaymentMethods(): Promise<PaymentMethod[]> {
        try {
            const response = await scancodeApi.getPaymentMethods();

            return response.data.map((dto): PaymentMethod => ({
                id: dto.id,
                remote_id: dto.id,
                is_sync: true,
                name: dto.name,
                created_at: dto.created_at,
                updated_at: dto.updated_at,
            }));
        } catch (err: unknown) {
            ScancodeAdapter.handleApiError(err);
        }
    }

    public static async createPaymentMethod(method: PaymentMethod): Promise<PaymentMethod> {
        try {
            const payload: PaymentMethodCreateRequestDTO = {
                name: method.name.trim(),
            };
            const response = await scancodeApi.postPaymentMethod(payload);
            const dto = response.data;

            return {
                ...method,
                id: dto.id,
                name: dto.name,
                created_at: dto.created_at,
                updated_at: dto.updated_at,
            };
        } catch (err: unknown) {
            ScancodeAdapter.handleApiError(err);
        }
    }

    public static async updatePaymentMethod(method: PaymentMethod): Promise<PaymentMethod> {
        try {
            const payload: PaymentMethodUpdateRequestDTO = {
                name: method.name.trim(),
            };
            const response = await scancodeApi.patchPaymentMethod(method.remote_id as number, payload);
            const dto = response.data;

            return {
                id: method.id,
                remote_id: dto.id,
                is_sync: true,
                name: dto.name,
                created_at: dto.created_at,
                updated_at: dto.updated_at,
            };
        } catch (err: unknown) {
            ScancodeAdapter.handleApiError(err);
        }
    }

    private static handleApiError(err: unknown): never {
        if (ScancodeAdapter.isNetworkError(err)) {
            throw new ApiException({ message: String(i18n.global.t('common.networkError')) });
        }

        const status: number = (err as HttpError).statusCode;

        if (status === 401) {
            clearAuth();
        }

        const body: ValidationErrorResponseDTO | undefined = (err as HttpError).body as ValidationErrorResponseDTO | undefined;

        throw new ApiException({
            message: body?.message ?? String(i18n.global.t('common.unexpectedError')),
            statusCode: status,
            errors: body?.errors,
        });
    }

    private static isNetworkError(err: unknown): boolean {
        return err instanceof HttpError && err.statusCode === 0;
    }

    private static nullableString(value: string | null | undefined): string {
        return value ?? '';
    }

    /** API / local `string | null` for buyer fields; empty or whitespace → null. */
    private static nullableBuyerField(value: string | null | undefined): string | null {
        if (value == null) {
            return null;
        }
        const trimmed: string = value.trim();
        return trimmed === '' ? null : trimmed;
    }

    private static toApiNullableString(value: string | null): string | null {
        if (value == null) {
            return null;
        }
        const trimmed: string = value.trim();
        return trimmed === '' ? null : trimmed;
    }
}
