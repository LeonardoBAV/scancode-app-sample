import type { ClientUpdateRequestDTO } from '../../types/dtos/scancode-request';
import type { ValidationErrorResponseDTO } from '../../types/dtos/scancode-response';
import { ApiException } from '../../types/exceptions/api-exception';
import type { Auth } from '../../types/sessions/auth';
import type { Client } from '../../types/schema/client';
import type { Event } from '../../types/schema/event';
import type { PaymentMethod } from '../../types/schema/payment-method';
import type { Product } from '../../types/schema/product';
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
                created_at: dto.created_at,
                updated_at: dto.updated_at,
            }));
        } catch (err: unknown) {
            ScancodeAdapter.handleApiError(err);
        }
    }

    public static async updateClient(client: Client): Promise<Client> {
        try {
            const remoteId: number = client.remote_id ?? client.id;
            const payload: ClientUpdateRequestDTO = {
                carrier: client.carrier.trim(),
                corporate_name: client.corporate_name.trim(),
                cpf_cnpj: client.cpf_cnpj.trim(),
                email: client.email.trim(),
                fantasy_name: client.fantasy_name.trim(),
                phone: client.phone.trim(),
            };
            const response = await scancodeApi.patchClient(remoteId, payload);
            const dto = response.data;

            return {
                id: client.id,
                remote_id: dto.id,
                is_sync: true,
                carrier: ScancodeAdapter.nullableString(dto.carrier),
                corporate_name: dto.corporate_name,
                cpf_cnpj: dto.cpf_cnpj,
                email: ScancodeAdapter.nullableString(dto.email),
                fantasy_name: ScancodeAdapter.nullableString(dto.fantasy_name),
                phone: ScancodeAdapter.nullableString(dto.phone),
                created_at: dto.created_at,
                updated_at: dto.updated_at,
            };
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
                    created_at: '',
                    updated_at: dto.updated_at,
                },
                created_at: dto.created_at,
                updated_at: dto.updated_at,
            }));
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
}
