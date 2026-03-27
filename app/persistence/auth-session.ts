import { ApplicationSettings } from '@nativescript/core';

import type { Auth, AuthProfile } from '../types/sessions/auth';

const AUTH_KEY: string = 'auth';

export function getAuth(): Auth | null {
    const raw: string | undefined = ApplicationSettings.getString(AUTH_KEY);
    if (!raw) {
        return null;
    }
    try {
        return JSON.parse(raw) as Auth;
    } catch {
        return null;
    }
}

export function setAuth(session: Auth): void {
    ApplicationSettings.setString(AUTH_KEY, JSON.stringify(session));
}

export function getToken(): string | null {
    return getAuth()?.token ?? null;
}

export function getSalesRepresentative(): AuthProfile | null {
    return getAuth()?.sales_representative ?? null;
}

export function clearAuth(): void {
    ApplicationSettings.remove(AUTH_KEY);
}

export type { Auth, AuthProfile };
