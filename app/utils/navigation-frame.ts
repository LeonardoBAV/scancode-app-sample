import { getCurrentInstance } from 'vue';
import { Frame, Page, type View } from '@nativescript/core';

/**
 * Frame that hosts the current Vue page (tab Frame inside Default, or root-frame on Events).
 * Prefer this over Frame.topmost() after visiting Profile on root-frame — topmost can
 * point at root-frame while the visible page lives in a nested tab Frame.
 */
export function getHostFrame(): Frame | null {
    const instance = getCurrentInstance();
    if (!instance) {
        return Frame.topmost();
    }

    const proxy = instance.proxy as { $page?: Page } | null;
    const page: Page | undefined = proxy?.$page;
    if (page?.frame) {
        return page.frame;
    }

    let view: View | null =
        (instance.vnode?.el as { nativeView?: View } | null)?.nativeView ?? null;
    while (view) {
        if (view instanceof Frame) {
            return view;
        }
        view = (view.parent as View | null) ?? null;
    }

    return Frame.topmost();
}
