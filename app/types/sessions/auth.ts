/**
 * Auth session stored in the app. Same keys as {@link LoginResponseDTO} / Laravel login JSON.
 */

export interface AuthProfile {
    id: number;
    cpf: string;
    name: string;
    email: string;
    created_at: string;
    updated_at: string;
    distributor_id: number;
}

export interface Auth {
    token: string;
    sales_representative: AuthProfile;
}
