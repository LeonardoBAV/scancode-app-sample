import { pdfCoreService } from '../pdf-core/pdf-core-service';
import { storageService } from '../storage/storage-service';

export class PdfService {
    private static readonly _instance: PdfService = new PdfService();

    private constructor() { }

    public static getInstance(): PdfService {
        return PdfService._instance;
    }

    public async generateHelloWorld(): Promise<string> {
        console.log('[PdfService] generateHelloWorld');
        const buffer = await pdfCoreService.generateHelloWorld();
        return storageService.save(buffer, 'hello-world.pdf');
    }

    public async generateSampleOrder(): Promise<string> {
        console.log('[PdfService] generateSampleOrder');
        const buffer = await pdfCoreService.generateSampleOrder();
        return storageService.save(buffer, 'sample-order.pdf');
    }
}

export const pdfService: PdfService = PdfService.getInstance();
