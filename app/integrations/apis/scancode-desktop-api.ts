import type { ScancodeDesktopHealthyResponseDTO } from '../../types/dtos/scancode-desktop-response';
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

    private static normalizeBaseUrl(baseUrl: string): string {
        return baseUrl.trim().replace(/\/+$/, '');
    }
}
