export interface MovementRequestDTO {
    sku: string;
    movement_uuid: string;
    qty: number;
}

export interface MovementCreateManyRequestDTO {
    movements: MovementRequestDTO[];
}

export interface MovementDeleteRequestDTO {
    movements: string[];
}
