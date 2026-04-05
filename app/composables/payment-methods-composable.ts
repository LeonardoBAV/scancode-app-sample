// --- Imports ---
import { ref, readonly, type DeepReadonly, type Ref } from 'vue';
import { PaymentMethodsRepository } from '../db/repositories/payment-methods.repo';
import type { PaymentMethod } from '../types/schema/payment-method';


export class PaymentMethodsComposable {
    private static paymentMethods: Ref<PaymentMethod[]> = ref<PaymentMethod[]>([]);
    private static isLoading: Ref<boolean> = ref<boolean>(false);

    private constructor() { }

    public static getList(): DeepReadonly<Ref<PaymentMethod[]>> {
        return readonly(PaymentMethodsComposable.paymentMethods);
    }

    public static getIsLoading(): DeepReadonly<Ref<boolean>> {
        return readonly(PaymentMethodsComposable.isLoading);
    }

    public static async refresh(): Promise<void> {
        PaymentMethodsComposable.isLoading.value = true;
        try {
            PaymentMethodsComposable.paymentMethods.value = await PaymentMethodsRepository.findAll();
        } catch (error: unknown) {
            console.error('[PaymentMethodsComposable] refresh failed:', error);
        } finally {
            PaymentMethodsComposable.isLoading.value = false;
        }
    }
}
