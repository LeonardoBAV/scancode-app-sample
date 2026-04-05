import type { ValidationErrorResponseDTO } from '../../types/dtos/scancode-response';
import { ApiException } from '../../types/exceptions/api-exception';
import type { Auth } from '../../types/sessions/auth';
import type { Client } from '../../types/schema/client';
import type { Event } from '../../types/schema/event';
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
