import { ApplicationSettings } from '@nativescript/core'

export const AUTH_KEY = 'auth'

export interface AuthProfile {
    nick: string
    name: string
    cpf: string
    email: string
    senha: string
}

export function getAuth(): AuthProfile | null {
    const raw = ApplicationSettings.getString(AUTH_KEY)
    if (!raw) return null
    try {
        const parsed = JSON.parse(raw) as AuthProfile
        if (parsed && typeof parsed.nick === 'string' && typeof parsed.name === 'string') { //obs: não sei se isso é necessário a interface já especifica isso...
            return parsed
        }
    } catch {
        // ignore invalid JSON
    }
    return null
}

export function setAuth(profile: AuthProfile): void {
    ApplicationSettings.setString(AUTH_KEY, JSON.stringify(profile))
}

export function clearAuth(): void {
    ApplicationSettings.remove(AUTH_KEY)
}
