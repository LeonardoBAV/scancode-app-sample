// --- Imports ---
import { PageComposable } from './PageComposable';
import { useSelectedOrder } from '../shared-state/SelectedOrderComposable';
import { showToast } from '../toast-state';
import { i18n } from '../../configs/i18n';

const t = i18n.global.t;

class OrderShowComposable extends PageComposable {

    public async cancel(note: string | null): Promise<void> {
        try {
            await useSelectedOrder.toCancel(note);
            showToast({ message: t('pages.orderShow.cancelSuccess'), variant: 'success' });
        } catch (err: unknown) {
            console.error(err);
            showToast({ message: t('pages.orderShow.cancelError'), variant: 'error' });
        }
    }
}

export const useOrderShow: OrderShowComposable = new OrderShowComposable();
