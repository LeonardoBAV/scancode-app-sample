import { isAndroid, Device as NativeScriptDevice } from '@nativescript/core';
import type { BarcodeScanner } from 'nativescript-barcodescanner';
import { showToast } from '../composables/toast-state';

export class Device {

    public static isEmulator(): boolean {
        if (isAndroid) {
            const fingerprint: string = (android as { os: { Build: { FINGERPRINT?: string } } }).os.Build.FINGERPRINT ?? '';
            return fingerprint.includes('generic') || fingerprint.includes('emulator');
        }
        return (NativeScriptDevice.deviceType as string) === 'Emulator';
    }

    public static async ensureCameraPermission(scanner: BarcodeScanner, deniedMessage: string): Promise<boolean> {
        const hasPermission: boolean = await scanner.hasCameraPermission();
        if (hasPermission) {
            return true;
        }
        try {
            await scanner.requestCameraPermission();
        } catch {
            showToast({ message: deniedMessage, variant: 'error' });
            return false;
        }
        const granted: boolean = await scanner.hasCameraPermission();
        if (!granted) {
            showToast({ message: deniedMessage, variant: 'error' });
        }
        return granted;
    }

}
