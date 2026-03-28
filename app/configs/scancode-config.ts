import { isAndroid } from '@nativescript/core';
import { Environment } from '../types/environment';
import { isEmulator } from '../utils/device';


const CURRENT_ENV: Environment = (process.env.NS_CURRENT_ENV as Environment) ?? Environment.Development;

function resolveBaseUrl(): string {
    return 'http://10.0.2.2:80';
    if (CURRENT_ENV === Environment.Development && isEmulator()) {
        return isAndroid ? 'http://10.0.2.2:80' : 'http://127.0.0.1:80';
    }
    return process.env.SCANCODE_API_URL ?? '';
}

export const SCANCODE_API_URL: string = resolveBaseUrl();
export const SCANCODE_API_VERSION: string = '/api/v1';

export { CURRENT_ENV };
