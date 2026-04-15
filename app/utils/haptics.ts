import { Haptics as NativeHaptics, HapticNotificationType } from '@nativescript/haptics';

export class Haptics {

    public static vibrateSuccess(): void {
        try {
            if (NativeHaptics.isSupported()) {
                NativeHaptics.notification(HapticNotificationType.SUCCESS);
            }
        } catch {
            // ignore if haptics fails
        }
    }

}
