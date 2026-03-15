import { Haptics, HapticNotificationType } from '@nativescript/haptics';

export function vibrateSuccess(): void {
    try {
        if (Haptics.isSupported()) {
            Haptics.notification(HapticNotificationType.SUCCESS);
        }
    } catch {
        // ignore if haptics fails
    }
}
