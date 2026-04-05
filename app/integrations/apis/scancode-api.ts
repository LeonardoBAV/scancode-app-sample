import { SCANCODE_API_URL, SCANCODE_API_VERSION } from '../../configs/scancode-config';
import type { ClientsResponseDTO, EventsResponseDTO, LoginResponseDTO } from '../../types/dtos/scancode-response';
import type { LoginRequestDTO } from '../../types/dtos/scancode-request';
import { createHttpClient, type HttpClient } from '../http-client';
import { getToken } from '../../persistence/auth-session';
import { Device } from '@nativescript/core';

const http: HttpClient = createHttpClient({
    baseURL: `${SCANCODE_API_URL}${SCANCODE_API_VERSION}`,
});

http.addRequestInterceptor((headers: Record<string, string>): Record<string, string> => {
    const token: string | null = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
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

export async function getEvents(): Promise<EventsResponseDTO> {
    const { data } = await http.get<EventsResponseDTO>('/events');
    return data;
}

export async function getClients(): Promise<ClientsResponseDTO> {
    const { data } = await http.get<ClientsResponseDTO>('/clients');
    return data;
}
