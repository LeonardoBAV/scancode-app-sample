import type { AxiosError } from 'axios';
import type { Auth } from '../../types/sessions/auth';
import type { ValidationErrorResponseDTO } from '../../types/dtos/scancode-response';
import { ApiException } from '../../types/exceptions/api-exception';
import { clearAuth } from '../../persistence/auth-session';
import * as scancodeApi from '../apis/scancode-api';


export async function login(cpf: string, password: string): Promise<Auth> {
    try {
        return await scancodeApi.login(cpf, password);
    } catch (err: unknown) {
        handleAxiosError(err);
    }
}


function handleAxiosError(err: unknown): never {
    const axiosErr: AxiosError<ValidationErrorResponseDTO> = err as AxiosError<ValidationErrorResponseDTO>;

    if (!axiosErr.response) {
        throw new ApiException({ message: 'Network error' });
    }

    const status: number = axiosErr.response.status;

    if (status === 401) {
        clearAuth();
    }

    const body: ValidationErrorResponseDTO | undefined = axiosErr.response.data;

    throw new ApiException({
        message: body?.message ?? 'Unexpected error',
        statusCode: status,
        errors: body?.errors,
    });
}