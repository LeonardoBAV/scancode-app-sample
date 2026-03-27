export class ApiException extends Error {
    public readonly statusCode: number | undefined;
    public readonly errors: Record<string, string[]> | undefined;

    constructor(options: {
        message: string;
        statusCode?: number;
        errors?: Record<string, string[]>;
    }) {
        super(options.message);
        this.name = 'ApiException';
        this.statusCode = options.statusCode;
        this.errors = options.errors;
    }

    get isNetworkError(): boolean {
        return this.statusCode === undefined;
    }

    get isUnauthorized(): boolean {
        return this.statusCode === 401;
    }

    get isValidationError(): boolean {
        return this.statusCode === 422;
    }
}
