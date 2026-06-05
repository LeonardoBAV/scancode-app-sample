import type { ScancodeDesktopHealthyResponseDTO } from '../../types/dtos/scancode-desktop/healthy-response';
import type { MovementCreateResponseDTO } from '../../types/dtos/scancode-desktop/movement-response';
import type { MovementRequestDTO } from '../../types/dtos/scancode-desktop/movement-request';
import { HttpClient } from '../http-client';


export class ScancodeDesktopApi extends HttpClient {
    public constructor(baseUrl: string) {
        super({
            baseURL: ScancodeDesktopApi.normalizeBaseUrl(baseUrl),
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

    private static normalizeBaseUrl(baseUrl: string): string {
        return baseUrl.trim().replace(/\/+$/, '');
    }
}
