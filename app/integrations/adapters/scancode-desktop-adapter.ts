import { i18n } from '../../configs/i18n';
import type { ScancodeDesktopHealthyResponseDTO } from '../../types/dtos/scancode-desktop/healthy-response';
import type { MovementRequestDTO } from '../../types/dtos/scancode-desktop/movement-request';
import type { MovementResponseDTO } from '../../types/dtos/scancode-desktop/movement-response';
import { ApiException } from '../../types/exceptions/api-exception';
import { HttpError } from '../../types/http/http-types';
import type { ScancodeDesktopHealthy } from '../../types/schema/scancode-desktop/healthy';
import type { Movement } from '../../types/schema/scancode-desktop/movement';
import { ScancodeDesktopApi } from '../apis/scancode-desktop-api';


export class ScancodeDesktopAdapter {
    public static async testConnection(baseUrl: string): Promise<ScancodeDesktopHealthy> {
        try {
            const normalizedUrl: string = ScancodeDesktopAdapter.normalizeAndValidateUrl(baseUrl);
            const response: ScancodeDesktopHealthyResponseDTO = await new ScancodeDesktopApi(normalizedUrl).healthy();

            return ScancodeDesktopAdapter.mapHealthyResponse(response);
        } catch (err: unknown) {
            ScancodeDesktopAdapter.handleApiError(err);
        }
    }

    public static async createMovement(baseUrl: string, payload: MovementRequestDTO): Promise<Movement> {
        try {
            const normalizedUrl: string = ScancodeDesktopAdapter.normalizeAndValidateUrl(baseUrl);
            const response = await new ScancodeDesktopApi(normalizedUrl).postMovement(payload);

            return ScancodeDesktopAdapter.mapMovementResponse(response.data);
        } catch (err: unknown) {
            ScancodeDesktopAdapter.handleApiError(err);
        }
    }

    private static normalizeAndValidateUrl(baseUrl: string): string {
        const normalizedUrl: string = baseUrl.trim().replace(/\/+$/, '');

        try {
            const url: URL = new URL(normalizedUrl);
            if (url.protocol !== 'http:' && url.protocol !== 'https:') {
                throw new Error('Invalid protocol');
            }

            return normalizedUrl;
        } catch {
            throw new ApiException({
                message: String(i18n.global.t('pages.eventHome.scancodeDesktopInvalidQrCode')),
            });
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

        throw new ApiException({
            message: String(i18n.global.t('pages.eventHome.scancodeDesktopConnectionError')),
            statusCode: status,
        });
    }

    private static isNetworkError(err: unknown): boolean {
        return err instanceof HttpError && err.statusCode === 0;
    }
}
