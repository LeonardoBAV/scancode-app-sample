import { i18n } from '../../configs/i18n';
import type { ScancodeDesktopHealthyResponseDTO } from '../../types/dtos/scancode-desktop/healthy-response';
import type { MovementCreateManyRequestDTO, MovementDeleteRequestDTO, MovementRequestDTO } from '../../types/dtos/scancode-desktop/movement-request';
import type { MovementResponseDTO } from '../../types/dtos/scancode-desktop/movement-response';
import { ApiException } from '../../types/exceptions/api-exception';
import { HttpError } from '../../types/http/http-types';
import type { ScancodeDesktopHealthy } from '../../types/schema/scancode-desktop/healthy';
import type { Movement } from '../../types/schema/scancode-desktop/movement';
import { ScancodeDesktopApi } from '../apis/scancode-desktop-api';


export class ScancodeDesktopAdapter {
    public static async testConnection(): Promise<ScancodeDesktopHealthy> {
        try {
            const response: ScancodeDesktopHealthyResponseDTO = await new ScancodeDesktopApi().healthy();

            return ScancodeDesktopAdapter.mapHealthyResponse(response);
        } catch (err: unknown) {
            ScancodeDesktopAdapter.handleApiError(err);
        }
    }

    public static async createMovement(sku: string, movementUuid: string, qty: number): Promise<Movement> {
        try {
            const payload: MovementRequestDTO = ScancodeDesktopAdapter.mapMovementRequest(sku, movementUuid, qty);
            const response = await new ScancodeDesktopApi().postMovement(payload);

            return ScancodeDesktopAdapter.mapMovementResponse(response.data);
        } catch (err: unknown) {
            ScancodeDesktopAdapter.handleApiError(err);
        }
    }

    public static async createMovements(movements: MovementRequestDTO[]): Promise<Movement[]> {
        try {
            const payload: MovementCreateManyRequestDTO = ScancodeDesktopAdapter.mapMovementCreateManyRequest(movements);
            const response = await new ScancodeDesktopApi().postMovements(payload);

            return response.data.map((movement: MovementResponseDTO): Movement => ScancodeDesktopAdapter.mapMovementResponse(movement));
        } catch (err: unknown) {
            ScancodeDesktopAdapter.handleApiError(err);
        }
    }

    public static async deleteMovements(movementUuids: string[]): Promise<number> {
        try {
            const payload: MovementDeleteRequestDTO = ScancodeDesktopAdapter.mapMovementDeleteRequest(movementUuids);
            const response = await new ScancodeDesktopApi().deleteMovements(payload);

            return response.deleted_count;
        } catch (err: unknown) {
            ScancodeDesktopAdapter.handleApiError(err);
        }
    }

    private static mapHealthyResponse(dto: ScancodeDesktopHealthyResponseDTO): ScancodeDesktopHealthy {
        if (dto.status !== 'ok' || !dto.url?.trim()) {
            throw new ApiException({
                message: String(i18n.global.t('pages.eventHome.scancodeDesktopConnectionError')),
            });
        }

        return {
            healthyUrl: dto.healthy_url,
            ip: dto.ip,
            port: dto.port,
            status: 'ok',
            url: dto.url.trim().replace(/\/+$/, ''),
        };
    }

    private static mapMovementRequest(sku: string, movementUuid: string, qty: number): MovementRequestDTO {
        return {
            sku,
            movement_uuid: movementUuid,
            qty,
        };
    }

    private static mapMovementCreateManyRequest(movements: MovementRequestDTO[]): MovementCreateManyRequestDTO {
        return {
            movements,
        };
    }

    private static mapMovementDeleteRequest(movementUuids: string[]): MovementDeleteRequestDTO {
        return {
            movements: movementUuids,
        };
    }

    private static mapMovementResponse(dto: MovementResponseDTO): Movement {
        return {
            id: dto.id,
            sku: dto.sku,
            movement_uuid: dto.movement_uuid,
            qty: dto.qty,
            created_at: dto.created_at,
            updated_at: dto.updated_at,
        };
    }

    private static handleApiError(err: unknown): never {
        if (err instanceof ApiException) {
            throw err;
        }

        if (ScancodeDesktopAdapter.isNetworkError(err)) {
            throw new ApiException({
                message: String(i18n.global.t('pages.eventHome.scancodeDesktopConnectionError')),
            });
        }

        const status: number | undefined = err instanceof HttpError ? err.statusCode : undefined;
        const message: string = err instanceof HttpError
            ? ScancodeDesktopAdapter.getHttpErrorMessage(err)
            : String(i18n.global.t('pages.eventHome.scancodeDesktopConnectionError'));

        throw new ApiException({
            message,
            statusCode: status,
        });
    }

    private static isNetworkError(err: unknown): boolean {
        return err instanceof HttpError && err.statusCode === 0;
    }

    private static getHttpErrorMessage(err: HttpError): string {
        if (ScancodeDesktopAdapter.hasMessage(err.body)) {
            return err.body.message;
        }

        return String(i18n.global.t('pages.eventHome.scancodeDesktopConnectionError'));
    }

    private static hasMessage(body: unknown): body is { message: string } {
        return typeof body === 'object'
            && body !== null
            && 'message' in body
            && typeof body.message === 'string'
            && body.message.trim().length > 0;
    }
}
