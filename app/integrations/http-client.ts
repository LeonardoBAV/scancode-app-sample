import { Http, type HttpResponse } from '@nativescript/core';

export interface HttpClientOptions {
    baseURL: string;
    timeoutMs?: number;
}

export interface HttpClientResponse<T = unknown> {
    data: T;
    statusCode: number;
}

type RequestInterceptor = (headers: Record<string, string>) => Record<string, string>;

export class HttpError extends Error {
    public readonly statusCode: number;
    public readonly body: unknown;

    constructor(statusCode: number, body: unknown) {
        super(`HTTP ${statusCode}`);
        this.name = 'HttpError';
        this.statusCode = statusCode;
        this.body = body;
    }
}

export class HttpClient {
    private readonly baseURL: string;
    private readonly timeoutMs: number;
    private readonly defaultHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };
    private readonly interceptors: RequestInterceptor[] = [];

    constructor(options: HttpClientOptions) {
        this.baseURL = options.baseURL;
        this.timeoutMs = options.timeoutMs ?? 15000;
    }

    addRequestInterceptor(fn: RequestInterceptor): void {
        this.interceptors.push(fn);
    }

    async get<T>(path: string): Promise<HttpClientResponse<T>> {
        return this.request<T>('GET', path);
    }

    async post<T>(path: string, body?: unknown): Promise<HttpClientResponse<T>> {
        return this.request<T>('POST', path, body);
    }

    async put<T>(path: string, body?: unknown): Promise<HttpClientResponse<T>> {
        return this.request<T>('PUT', path, body);
    }

    async patch<T>(path: string, body?: unknown): Promise<HttpClientResponse<T>> {
        return this.request<T>('PATCH', path, body);
    }

    async delete<T>(path: string): Promise<HttpClientResponse<T>> {
        return this.request<T>('DELETE', path);
    }

    private async request<T>(method: string, path: string, body?: unknown): Promise<HttpClientResponse<T>> {
        let headers: Record<string, string> = { ...this.defaultHeaders };

        for (const interceptor of this.interceptors) {
            headers = interceptor(headers);
        }

        const response: HttpResponse = await Http.request({
            url: `${this.baseURL}${path}`,
            method,
            headers,
            content: body !== undefined ? JSON.stringify(body) : undefined,
            timeout: this.timeoutMs,
        });

        const data: T = response.content.toJSON() as T;

        if (response.statusCode < 200 || response.statusCode >= 300) {
            throw new HttpError(response.statusCode, data);
        }

        return { data, statusCode: response.statusCode };
    }
}

export function createHttpClient(options: HttpClientOptions): HttpClient {
    return new HttpClient(options);
}
