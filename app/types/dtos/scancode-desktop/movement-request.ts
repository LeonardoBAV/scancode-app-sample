export interface MovementRequestDTO {
    sku: string;
    movement_uuid: string;
    qty: number;
}

export interface MovementDeleteRequestDTO {
    movements: string[];
}
