export interface MovementResponseDTO {
    id: number;
    sku: string;
    movement_uuid: string;
    qty: number;
    created_at: string;
    updated_at: string;
}

export interface MovementCreateResponseDTO {
    data: MovementResponseDTO;
}
