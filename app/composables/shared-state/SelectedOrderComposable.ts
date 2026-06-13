// --- Imports ---
import { ref, readonly, type DeepReadonly, type Ref } from 'vue';
import { Uuid } from '../../utils/uuid';
import { OrdersRepository } from '../../db/repositories/orders.repo';
import { OrderItemsRepository } from '../../db/repositories/order-items.repo';
import { ScancodeDesktopAdapter } from '../../integrations/adapters/scancode-desktop-adapter';
import type { Order } from '../../types/schema/order';
import type { OrderItem } from '../../types/schema/order-item';
import type { Product } from '../../types/schema/product';
import { useScancodeDesktop } from '../useScancodeDesktop';

class SelectedOrderComposable {
    private readonly order: Ref<Order | null> = ref<Order | null>(null);

    public getOrder(): DeepReadonly<Ref<Order | null>> {
        return readonly(this.order);
    }

    public async setOrder(orderId: number): Promise<void> {
        this.order.value = await OrdersRepository.findByIdWithRelations(orderId);
    }

    public clear(): void {
        this.order.value = null;
    }

    public async refresh(): Promise<void> {
        if (!this.order.value || !this.order.value.id) {
            throw new Error('Order not found');
        }

        await this.setOrder(this.order.value.id);
    }

    public async toCancel(note: string | null): Promise<void> {
        await OrdersRepository.updateNotes(this.order.value?.id as number, note);
        await OrdersRepository.updateStatus(this.order.value?.id as number, 'cancelled');
        await this.refresh();
    }

    public async createOrderItem(product: Product, qty: number): Promise<void> {
        const movement: string | null = await this.ensureScancodeDesktopMovement(product.sku, null, qty);

        await OrderItemsRepository.createOne({
            id: null,
            movement,
            order_id: this.order.value?.id as number,
            product_id: product.id as number,
            price: product.price,
            qty,
            notes: null,
        });
        await this.refresh();
    }

    public async updateQty(item: OrderItem, qty: number): Promise<void> {
        const uuid: string | null = await this.ensureScancodeDesktopMovement(item.product?.sku as string, item.movement, qty);
        await OrderItemsRepository.setQtyById(item.id as number, qty, uuid);
        await this.refresh();
    }

    private async ensureScancodeDesktopMovement(sku: string, movement: string | null, qty: number): Promise<string | null> {
        if (!useScancodeDesktop.isRequiredForStockLimit.value) {
            return null;
        }

        const uuid: string = movement ?? Uuid.generateMovementUuid();

        await ScancodeDesktopAdapter.createMovement(sku, uuid, qty);

        return uuid;
    }

}

export const useSelectedOrder: SelectedOrderComposable = new SelectedOrderComposable();
