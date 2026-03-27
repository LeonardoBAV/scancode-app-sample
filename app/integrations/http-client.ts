import axios, { type AxiosInstance } from 'axios';

export interface CreateHttpClientOptions {
    baseURL: string;
    timeoutMs?: number;
}

export function createHttpClient(options: CreateHttpClientOptions): AxiosInstance {
    const baseURL: string = options.baseURL;
    const timeoutMs: number = options.timeoutMs ?? 15000;

    return axios.create({
        baseURL,
        timeout: timeoutMs,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    });
}
