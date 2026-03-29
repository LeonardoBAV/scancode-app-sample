import type { ValidationErrorResponseDTO } from '../../types/dtos/scancode-response';
import { ApiException } from '../../types/exceptions/api-exception';
import type { Auth } from '../../types/sessions/auth';
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
