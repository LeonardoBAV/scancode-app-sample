import type { ValidationErrorResponseDTO } from '../../types/dtos/scancode-response';
import { ApiException } from '../../types/exceptions/api-exception';
import type { Auth } from '../../types/sessions/auth';
import type { Event } from '../../types/schema/event';
import { i18n } from '../../configs/i18n';
import { clearAuth } from '../../persistence/auth-session';
import { HttpError } from '../../types/http/http-types';
import * as scancodeApi from '../apis/scancode-api';


export async function login(cpf: string, password: string): Promise<Auth> {
    try {
        return await scancodeApi.login(cpf, password);
    } catch (err: unknown) {
        handleApiError(err);
    }
}

export async function getEvents(): Promise<Event[]> {
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
        handleApiError(err);
    }
}


function handleApiError(err: unknown): never {
    if (isNetworkError(err)) {
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

function isNetworkError(err: unknown): boolean {
    return err instanceof HttpError && err.statusCode === 0;
}
