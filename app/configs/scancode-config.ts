import { isAndroid } from '@nativescript/core';
import { Environment } from '../types/environment';
import { Device } from '../utils/device';


const CURRENT_ENV: Environment = (process.env.NS_CURRENT_ENV as Environment) ?? Environment.Development;

function resolveBaseUrl(): string {
    const fromEnv: string = (process.env.SCANCODE_API_URL ?? '').trim();
    if (fromEnv) {
        return fromEnv;
    }
    // Fallback só em dev + emulador, quando .env não define URL
    if (CURRENT_ENV === Environment.Development && Device.isEmulator()) {
        return isAndroid ? 'http://10.0.2.2:80' : 'http://127.0.0.1:80';
    }
    return '';
}

export const SCANCODE_API_URL: string = resolveBaseUrl();
export const SCANCODE_API_VERSION: string = '/api/v1';

export { CURRENT_ENV };
