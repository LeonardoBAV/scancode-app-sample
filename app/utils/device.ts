import { isAndroid, Device } from '@nativescript/core';

export function isEmulator(): boolean {
    if (isAndroid) {
        const fingerprint: string = (android as { os: { Build: { FINGERPRINT?: string } } }).os.Build.FINGERPRINT ?? '';
        return fingerprint.includes('generic') || fingerprint.includes('emulator');
    }
    return (Device.deviceType as string) === 'Emulator';
}
