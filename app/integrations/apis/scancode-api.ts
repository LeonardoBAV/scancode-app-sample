import type { InternalAxiosRequestConfig } from 'axios';
import { SCANCODE_API_URL, SCANCODE_API_VERSION } from '../../configs/scancode-config';
import { getToken } from '../../persistence/auth-session';
import type { LoginResponseDTO } from '../../types/dtos/scancode-response';
import type { LoginRequestDTO } from '../../types/dtos/scancode-request';
import { createHttpClient } from '../http-client';
import { Device } from '@nativescript/core';

const http = createHttpClient({
    baseURL: `${SCANCODE_API_URL}${SCANCODE_API_VERSION}`,
});

http.interceptors.request.use((config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token: string | null = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export async function login(cpf: string, password: string): Promise<LoginResponseDTO> {
    const payload: LoginRequestDTO = {
        cpf,
        password,
        device_name: `${Device.manufacturer} ${Device.model}`,
    };
    const { data } = await http.post<LoginResponseDTO>('/auth/login', payload);
    return data;
}
