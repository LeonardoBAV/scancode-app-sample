// --- Imports ---
import { ref, readonly, type DeepReadonly, type Ref } from 'vue';
import { ProductsRepository } from '../db/repositories/products.repo';
import type { Product } from '../types/schema/product';


export class ProductsComposable {
    private static products: Ref<Product[]> = ref<Product[]>([]);
    private static isLoading: Ref<boolean> = ref<boolean>(false);

    private constructor() { }

    public static getList(): DeepReadonly<Ref<Product[]>> {
        return readonly(ProductsComposable.products);
    }

    public static getIsLoading(): DeepReadonly<Ref<boolean>> {
        return readonly(ProductsComposable.isLoading);
    }

    public static async refresh(): Promise<void> {
        ProductsComposable.isLoading.value = true;
        try {
            ProductsComposable.products.value = await ProductsRepository.findAll();
        } catch (error: unknown) {
            console.error('[ProductsComposable] refresh failed:', error);
        } finally {
            ProductsComposable.isLoading.value = false;
        }
    }
}
