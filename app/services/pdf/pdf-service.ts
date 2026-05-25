import { OrdersRepository } from '../../db/repositories/orders.repo';
import { PaymentMethodsRepository } from '../../db/repositories/payment-methods.repo';
import type { Order } from '../../types/schema/order';
import type { PaymentMethod } from '../../types/schema/payment-method';
import { pdfCoreService } from '../pdf-core/pdf-core-service';
import { storageService } from '../storage/storage-service';


export class PdfService {
    private static readonly _instance: PdfService = new PdfService();
    private static readonly DISTRIBUTOR_NAME: string = 'Distribuidora';

    private constructor() { }

    public static getInstance(): PdfService {
        return PdfService._instance;
    }

    public async generateOrder(orderId: number): Promise<string> {
        console.log('[PdfService] generateOrder', orderId);
        const order: Order | null = await OrdersRepository.findByIdWithRelations(orderId);
        if (order == null) {
            throw new Error(`Order not found: ${orderId}`);
        }
        const paymentMethodName: string = await PdfService.resolvePaymentMethodName(order.payment_method_id);
        const distributorName: string = PdfService.DISTRIBUTOR_NAME;
        const buffer: Uint8Array = await pdfCoreService.generateOrder(order, paymentMethodName, distributorName);
        return storageService.save(buffer, `order-${orderId}.pdf`);
    }

    private static async resolvePaymentMethodName(paymentMethodId: number | null): Promise<string> {
        if (paymentMethodId == null) {
            return '—';
        }
        const methods: PaymentMethod[] = await PaymentMethodsRepository.findAll();
        const match: PaymentMethod | undefined = methods.find((m: PaymentMethod) => m.id === paymentMethodId);
        return match?.name?.trim() || '—';
    }
}

export const pdfService: PdfService = PdfService.getInstance();
