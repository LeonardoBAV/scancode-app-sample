export interface HttpClientOptions {
    baseURL: string;
    timeoutMs?: number;
}

export interface HttpClientResponse<T = unknown> {
    data: T;
    statusCode: number;
}

export type RequestInterceptor = (headers: Record<string, string>) => Record<string, string>;

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
