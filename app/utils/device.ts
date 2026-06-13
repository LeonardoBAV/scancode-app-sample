import { isAndroid, Device as NativeScriptDevice } from '@nativescript/core';

export class Device {

    public static isEmulator(): boolean {
        if (isAndroid) {
            const fingerprint: string = (android as { os: { Build: { FINGERPRINT?: string } } }).os.Build.FINGERPRINT ?? '';
            return fingerprint.includes('generic') || fingerprint.includes('emulator');
        }
        return (NativeScriptDevice.deviceType as string) === 'Emulator';
    }

}
