// --- Imports ---
import { BarcodeScanner } from 'nativescript-barcodescanner';
import { i18n } from '../configs/i18n';

type BarcodeScannerOptions = Parameters<BarcodeScanner['scan']>[0];
type BarcodeScannerResult = Awaited<ReturnType<BarcodeScanner['scan']>>;
type ScannerErrorContext = 'cart' | 'scancodeDesktop';


export class ScannerService {
    private constructor() { }

    public static async scanProductBarcode(): Promise<string> {
        const result: BarcodeScannerResult = await ScannerService.scan(ScannerService.getProductBarcodeOptions());
        return result.text.trim();
    }

    public static async scanQrCode(): Promise<string> {
        const result: BarcodeScannerResult = await ScannerService.scan(ScannerService.getQrCodeOptions());
        return result.text.trim();
    }

    public static isScanCancelled(error: unknown): boolean {
        const message: string = error instanceof Error ? error.message : String(error);
        return message.includes('Scan aborted') || message.includes('abort');
    }

    public static getScanErrorMessage(error: unknown, context: ScannerErrorContext): string {
        const message: string = error instanceof Error ? error.message : String(error);
        const lowerMessage: string = message.toLowerCase();

        if (lowerMessage.includes('unavailable')) {
            return context === 'cart'
                ? String(i18n.global.t('pages.cart.scanCameraUnavailable'))
                : String(i18n.global.t('pages.eventHome.scancodeDesktopCameraUnavailable'));
        }

        if (lowerMessage.includes('camera') || lowerMessage.includes('permission')) {
            return context === 'cart'
                ? String(i18n.global.t('pages.cart.scanPermissionDenied'))
                : String(i18n.global.t('pages.eventHome.scancodeDesktopPermissionDenied'));
        }

        return context === 'cart'
            ? String(i18n.global.t('pages.cart.scanError'))
            : String(i18n.global.t('pages.eventHome.scancodeDesktopConnectionError'));
    }

    private static async scan(options: BarcodeScannerOptions): Promise<BarcodeScannerResult> {
        const scanner: BarcodeScanner = await ScannerService.createBarcodeScanner();
        return scanner.scan(options);
    }

    private static async createBarcodeScanner(): Promise<BarcodeScanner> {
        const scanner: BarcodeScanner = new BarcodeScanner();
        const hasPermission: boolean = await ScannerService.ensureCameraPermission(scanner);
        if (!hasPermission) {
            throw new Error('Camera permission denied');
        }

        return scanner;
    }

    private static async ensureCameraPermission(scanner: BarcodeScanner): Promise<boolean> {
        const hasPermission: boolean = await scanner.hasCameraPermission();
        if (hasPermission) {
            return true;
        }
        await scanner.requestCameraPermission();
        return scanner.hasCameraPermission();
    }

    private static getProductBarcodeOptions(): BarcodeScannerOptions {
        return {
            formats: 'EAN_13, EAN_8, UPC_A, UPC_E, CODE_128, CODE_39, ITF',
            cancelLabel: String(i18n.global.t('pages.cart.scanCancel')),
            message: String(i18n.global.t('pages.cart.scanMessage')),
            preferFrontCamera: false,
            showFlipCameraButton: false,
            showTorchButton: true,
            torchOn: false,
            resultDisplayDuration: 0,
            openSettingsIfPermissionWasPreviouslyDenied: true,
        };
    }

    private static getQrCodeOptions(): BarcodeScannerOptions {
        return {
            formats: 'QR_CODE',
            cancelLabel: String(i18n.global.t('pages.eventHome.scancodeDesktopScanCancel')),
            message: String(i18n.global.t('pages.eventHome.scancodeDesktopScanMessage')),
            preferFrontCamera: false,
            showFlipCameraButton: false,
            showTorchButton: true,
            torchOn: false,
            resultDisplayDuration: 0,
            openSettingsIfPermissionWasPreviouslyDenied: true,
        };
    }
}
