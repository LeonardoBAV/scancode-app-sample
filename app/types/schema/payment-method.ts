export interface PaymentMethod {
    id: number | null;
    remote_id: number | null;
    is_sync: boolean;
    name: string;
    created_at: string;
    updated_at: string;
}
