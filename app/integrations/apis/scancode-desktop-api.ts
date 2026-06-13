import type { ScancodeDesktopHealthyResponseDTO } from '../../types/dtos/scancode-desktop/healthy-response';
import type { MovementCreateManyResponseDTO, MovementCreateResponseDTO, MovementDeleteResponseDTO } from '../../types/dtos/scancode-desktop/movement-response';
import type { MovementCreateManyRequestDTO, MovementDeleteRequestDTO, MovementRequestDTO } from '../../types/dtos/scancode-desktop/movement-request';
import { i18n } from '../../configs/i18n';
import { useScancodeDesktop } from '../../composables/useScancodeDesktop';
import { ApiException } from '../../types/exceptions/api-exception';
import { HttpClient } from '../http-client';


export class ScancodeDesktopApi extends HttpClient {
    public constructor() {
        super({
            baseURL: ScancodeDesktopApi.getBaseUrl(),
            timeoutMs: 5000,
        });
    }

    public async healthy(): Promise<ScancodeDesktopHealthyResponseDTO> {
        const { data } = await this.get<ScancodeDesktopHealthyResponseDTO>('/api/healthy');
        return data;
    }

    public async postMovement(payload: MovementRequestDTO): Promise<MovementCreateResponseDTO> {
        const { data } = await this.post<MovementCreateResponseDTO>('/api/movements', payload);
        return data;
    }

    public async postMovements(payload: MovementCreateManyRequestDTO): Promise<MovementCreateManyResponseDTO> {
        const { data } = await this.post<MovementCreateManyResponseDTO>('/api/movements/many', payload);
        return data;
    }

    public async deleteMovements(payload: MovementDeleteRequestDTO): Promise<MovementDeleteResponseDTO> {
        const { data } = await this.delete<MovementDeleteResponseDTO>('/api/movements', payload);
        return data;
    }

    private static getBaseUrl(): string {
        const baseUrl: string | null = useScancodeDesktop.getUrl().value;

        if (baseUrl == null) {
            throw new ApiException({
                message: String(i18n.global.t('pages.eventHome.scancodeDesktopConnectionError')),
            });
        }

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
}
