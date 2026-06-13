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
        if (this.isDesktopMovementRequired()) {
            await this.deleteManyMovements();
        }

        await OrdersRepository.updateNotes(this.order.value?.id as number, note);
        await OrdersRepository.updateStatus(this.order.value?.id as number, 'cancelled');
        await this.refresh();
    }

    public async createOrderItem(product: Product, qty: number): Promise<void> {
        let uuid: string | null = null;
        if (this.isDesktopMovementRequired()) {
            const uuid: string = Uuid.generateMovementUuid();
            this.createMovement(product.sku, uuid, qty);
        }

        await OrderItemsRepository.createOne({
            id: null,
            movement: uuid,
            order_id: this.order.value?.id as number,
            product_id: product.id as number,
            price: product.price,
            qty,
            notes: null,
        });
        await this.refresh();
    }

    public async updateQty(item: OrderItem, qty: number): Promise<void> {
        if (this.isDesktopMovementRequired()) {
            item.movement = item.movement ?? Uuid.generateMovementUuid();
            this.createMovement(item.product?.sku as string, item.movement as string, qty);
        }

        await OrderItemsRepository.setQtyById(item.id as number, qty, item.movement);
        await this.refresh();
    }

    /** BEGIN movements considerando arrastar isso para um service */
    private async deleteManyMovements(): Promise<void> {
        const uuids: string[] = this.order.value?.order_items
            ?.map((item: OrderItem): string | null => item.movement)
            .filter((movement: string | null): movement is string => movement !== null) ?? [];

        await ScancodeDesktopAdapter.deleteMovements(uuids);
    }

    private async createMovement(sku: string, uuid: string, qty: number): Promise<void> {
        await ScancodeDesktopAdapter.createMovement(sku, uuid, qty);
    }

    private isDesktopMovementRequired(): boolean {
        return useScancodeDesktop.isRequiredForStockLimit.value;
    }
    /** END movements considerando arrastar isso para um service */

}

export const useSelectedOrder: SelectedOrderComposable = new SelectedOrderComposable();
