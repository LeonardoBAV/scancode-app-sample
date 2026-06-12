// --- Imports ---
import { ref, readonly, type DeepReadonly, type Ref } from 'vue';
import { Uuid } from '../../utils/uuid';
import { OrdersRepository } from '../../db/repositories/orders.repo';
import { OrderItemsRepository } from '../../db/repositories/order-items.repo';
import { ScancodeDesktopAdapter } from '../../integrations/adapters/scancode-desktop-adapter';
import { i18n } from '../../configs/i18n';
import { ApiException } from '../../types/exceptions/api-exception';
import type { Order } from '../../types/schema/order';
import type { OrderItem } from '../../types/schema/order-item';
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

    public async updateQty(item: OrderItem, qty: number): Promise<void> {
        const uuid: string | null = await this.ensureScancodeDesktopMovement(item, qty);
        await OrderItemsRepository.setQtyById(item.id as number, qty, uuid);
        await this.refresh();
    }

    private async ensureScancodeDesktopMovement(item: OrderItem, newQty: number): Promise<string | null> {
        if (!useScancodeDesktop.isRequiredForStockLimit.value) {
            return null;
        }

        const qty: number = newQty;
        const sku: string = item.product?.sku as string;
        const uuid: string = item.movement ?? Uuid.generateMovementUuid();

        await ScancodeDesktopAdapter.createMovement(sku, uuid, qty);

        return uuid;
    }

}

export const useSelectedOrder: SelectedOrderComposable = new SelectedOrderComposable();
