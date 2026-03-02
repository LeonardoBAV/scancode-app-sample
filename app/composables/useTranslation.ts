import { i18n } from '../configs/i18n';


export function useTranslation() {
    const t = i18n.global.t;
    const locale = i18n.global.locale;

    return { t, locale };
}
