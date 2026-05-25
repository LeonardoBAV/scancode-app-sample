import { pdfCoreMakeService } from './pdf-core-make-service';
import { pdfCoreTemplateService } from './pdf-core-template-service';

export class PdfCoreService {
    private static readonly _instance: PdfCoreService = new PdfCoreService();

    private constructor() { }

    public static getInstance(): PdfCoreService {
        return PdfCoreService._instance;
    }

    public generateHelloWorld(): Promise<Uint8Array> {
        console.log('[PdfCoreService] generateHelloWorld');
        const docDefinition = pdfCoreTemplateService.buildHelloWorld();
        return pdfCoreMakeService.generateBuffer(docDefinition);
    }

    public generateSampleOrder(): Promise<Uint8Array> {
        console.log('[PdfCoreService] generateSampleOrder');
        const docDefinition = pdfCoreTemplateService.buildSampleOrder();
        return pdfCoreMakeService.generateBuffer(docDefinition);
    }
}

export const pdfCoreService: PdfCoreService = PdfCoreService.getInstance();
