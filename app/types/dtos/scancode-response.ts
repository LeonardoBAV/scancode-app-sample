export interface ValidationErrorResponseDTO {
    message: string;
    errors?: Record<string, string[]>;
}

export interface ProfileDTO {
    id: number;
    cpf: string;
    name: string;
    email: string;
    created_at: string;
    updated_at: string;
    distributor_id: number;
}

export interface LoginResponseDTO {
    token: string;
    sales_representative: ProfileDTO;
}

export interface EventDTO {
    id: number;
    name: string;
    start: string;
    end: string;
    created_at: string;
    updated_at: string;
}

export interface EventsResponseDTO {
    data: EventDTO[];
}
