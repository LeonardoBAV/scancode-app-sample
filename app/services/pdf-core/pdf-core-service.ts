import type { Order } from '../../types/schema/order';
import { pdfCoreMakeService } from './pdf-core-make-service';
import { pdfCoreTemplateService } from './pdf-core-template-service';


export class PdfCoreService {
    private static readonly _instance: PdfCoreService = new PdfCoreService();

    private constructor() { }

    public static getInstance(): PdfCoreService {
        return PdfCoreService._instance;
    }

    public generateOrder(order: Order, paymentMethodName: string, distributorName: string): Promise<Uint8Array> {
        console.log('[PdfCoreService] generateOrder', order.id);
        const docDefinition = pdfCoreTemplateService.buildOrder(order, paymentMethodName, distributorName);
        return pdfCoreMakeService.generateBuffer(docDefinition);
    }
}

export const pdfCoreService: PdfCoreService = PdfCoreService.getInstance();
