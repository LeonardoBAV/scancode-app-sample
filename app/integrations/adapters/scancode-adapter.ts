import type { ValidationErrorResponseDTO } from '../../types/dtos/scancode-response';
import { ApiException } from '../../types/exceptions/api-exception';
import type { Auth } from '../../types/sessions/auth';
import { clearAuth } from '../../persistence/auth-session';
import { HttpError } from '../http-client';
import * as scancodeApi from '../apis/scancode-api';


export async function login(cpf: string, password: string): Promise<Auth> {
    try {
        return await scancodeApi.login(cpf, password);
    } catch (err: unknown) {
        handleApiError(err);
    }
}


function handleApiError(err: unknown): never {
    if (!(err instanceof HttpError)) {
        throw new ApiException({ message: 'Network error' });
    }

    const status: number = err.statusCode;

    if (status === 401) {
        clearAuth();
    }

    const body: ValidationErrorResponseDTO | undefined = err.body as ValidationErrorResponseDTO | undefined;

    throw new ApiException({
        message: body?.message ?? 'Unexpected error',
        statusCode: status,
        errors: body?.errors,
    });
}
