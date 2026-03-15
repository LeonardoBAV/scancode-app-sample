const codepoints: Record<string, number> = {
    'user': 0xe19f,
    'user-round': 0xe468,
    'circle-user': 0xe461,
    'users': 0xe1a4,
    'clipboard-list': 0xe086,
    'package': 0xe129,
    'credit-card': 0xe0aa,
    'log-out': 0xe10e,
    'log-in': 0xe10d,
    'refresh-cw': 0xe145,
    'chevron-right': 0xe06f,
    'chevron-left': 0xe06e,
    'chevron-down': 0xe06d,
    'chevron-up': 0xe070,
    'arrow-left': 0xe048,
    'arrow-right': 0xe049,
    'search': 0xe151,
    'plus': 0xe13d,
    'minus': 0xe11c,
    'x': 0xe1b2,
    'check': 0xe06c,
    'settings': 0xe154,
    'bell': 0xe059,
    'home': 0xe0f5,
    'calendar': 0xe063,
    'calendar-days': 0xe2b9,
    'shopping-cart': 0xe15c,
    'trash-2': 0xe18e,
    'pencil': 0xe1f9,
    'eye': 0xe0ba,
    'eye-off': 0xe0bb,
    'mail': 0xe10f,
    'phone': 0xe133,
    'map-pin': 0xe111,
    'clock': 0xe087,
    'star': 0xe176,
    'heart': 0xe0f2,
    'info': 0xe0f9,
    'alert-triangle': 0xe193,
    'circle-alert': 0xe077,
    'menu': 0xe115,
    'filter': 0xe0dc,
    'sort-asc': 0xe04c,
    'sort-desc': 0xe047,
    'download': 0xe0b2,
    'upload': 0xe19e,
    'share': 0xe155,
    'copy': 0xe09e,
    'lock': 0xe10b,
    'unlock': 0xe10c,
    'list': 0xe106,
    'grid-2x2': 0xe4ff,
    'layout-grid': 0xe0ff,
    'receipt': 0xe3d3,
    'wallet': 0xe204,
    'banknote': 0xe052,
    'store': 0xe3e4,
    'truck': 0xe194,
    'box': 0xe061,
    'image': 0xe0f6,
    'camera': 0xe064,
    'sun': 0xe178,
    'moon': 0xe11e,
    'loader-2': 0xe10a,
    'circle-check': 0xe226,
    'circle-x': 0xe084,
    'scan-barcode': 0xe535,
    'barcode': 0xe533,
    'qr-code': 0xe1df,
    'tag': 0xe17f,
    'tags': 0xe35c,
    'hash': 0xe0ef,
    'at-sign': 0xe04e,
    'printer': 0xe141,
};

export type LucideIcon = keyof typeof codepoints;

/**
 * Returns the unicode character for a Lucide icon name.
 * Use with `class="lucide"` on a Label.
 *
 * @example
 * ```xml
 * <Label :text="lucide('user')" class="lucide text-xl text-foreground" />
 * ```
 */
export function lucide(name: LucideIcon): string {
    const cp = codepoints[name];
    return String.fromCharCode(cp);
}
