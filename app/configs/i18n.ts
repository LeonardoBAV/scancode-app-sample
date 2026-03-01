import { createI18n } from 'vue-i18n';
import { getString, setString } from '@nativescript/core/application-settings';

import ptBR from '../locales/pt-BR.json';
import en from '../locales/en.json';

const STORAGE_KEY = '__app__locale__';

const savedLocale = getString(STORAGE_KEY, 'pt-BR');

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: savedLocale,
  fallbackLocale: 'pt-BR',
  messages: {
    'pt-BR': ptBR,
    en: en,
  },
});

function getLocaleRef(): { value: string } {
  return i18n.global.locale as unknown as { value: string };
}

export function setLocale(locale: string): void {
  getLocaleRef().value = locale;
  setString(STORAGE_KEY, locale);
}

export function getLocale(): string {
  return getLocaleRef().value;
}
