import { i18n } from '../../configs/i18n';
import type { ScancodeDesktopHealthyResponseDTO } from '../../types/dtos/scancode-desktop-response';
import { ApiException } from '../../types/exceptions/api-exception';
import { HttpError } from '../../types/http/http-types';
import type { ScancodeDesktopHealthy } from '../../types/schema/scancode-desktop-healthy';
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
