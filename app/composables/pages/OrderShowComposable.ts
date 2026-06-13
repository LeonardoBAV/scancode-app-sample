// --- Imports ---
import { PageComposable } from './PageComposable';
import { useSelectedOrder } from '../shared-state/SelectedOrderComposable';
import { showToast } from '../toast-state';
import { i18n } from '../../configs/i18n';
import { ApiException } from '../../types/exceptions/api-exception';

const t = i18n.global.t;

class OrderShowComposable extends PageComposable {

    public async cancel(note: string | null): Promise<void> {
        try {
            await useSelectedOrder.toCancel(note);
            showToast({ message: t('pages.orderShow.cancelSuccess'), variant: 'success' });
        } catch (err: unknown) {

            if (err instanceof ApiException) {
                showToast({ message: err.message, variant: 'error' });
                return;
            }

            console.error(err);
            showToast({ message: t('pages.orderShow.cancelError'), variant: 'error' });
        }
    }

    public async reopen(): Promise<void> {
        try {
            await useSelectedOrder.toReopen();
            showToast({ message: t('pages.orderShow.reopenSuccess'), variant: 'success' });
        } catch (err: unknown) {
            console.error(err);
            showToast({ message: t('pages.orderShow.reopenError'), variant: 'error' });
        }
    }
}

export const useOrderShow: OrderShowComposable = new OrderShowComposable();
